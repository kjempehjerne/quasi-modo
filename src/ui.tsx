/** @jsxImportSource preact */
import { h } from 'preact';
import { emit } from '@create-figma-plugin/utilities'
import type { JSX } from "preact";
import { useCallback, useState } from 'preact/hooks'
import { CloseHandler, ChangeModeHandler, Group } from './types';
import {
  Button,
  Columns,
  Muted,
  Container,
  render,
  Text,
  VerticalSpace,
  Dropdown,
  DropdownOption,
  Stack,
  useWindowResize,
} from '@create-figma-plugin/ui'
 

function Plugin(props: { modes: string[], selected: number }) {
  const [selected, setSelected] = useState<number>(props.selected);
  const [dropdownGroups, setDropdownGroups] = useState(createDropdownGroups(props.modes));

  onmessage = (event) => {
    const { type, data } = event.data.pluginMessage;
    type === "UPDATE_SELECTED" && setSelected(data);
  };

  function onWindowResize(windowSize: { width: number; height: number }) {
    emit('RESIZE_WINDOW', windowSize)
  }
  useWindowResize(onWindowResize, {
    minWidth: 120,
    minHeight: 120,
    maxWidth: 320,
    maxHeight: 320
  })

  const feedBackStyle = {
    height: '100%',
    width: '100%',
    display: 'flex',
    alignItems: 'center'
  }
  const errorStyle = {
    color: 'var(--figma-color-text-danger)',
  }
  const handleCloseButtonClick = useCallback(function () {
    emit<CloseHandler>('CLOSE')
  }, [])
  return (
    <Container space="medium">
      <VerticalSpace space="large" />
      <VerticalSpace space="small" />
      { dropdownGroups.map(group => (
        <ModeOption modes={group.modes} title={group.title} />
      ))}
      <Columns>
        <div>
            {selected === 0 && <div style={{...feedBackStyle, ...errorStyle}}>No Frames Selected</div>}
            {selected > 0 && <div style={{...feedBackStyle}}>{selected} Frames Selected</div>}
        </div>
        <Button fullWidth onClick={handleCloseButtonClick} secondary>
          Close
        </Button>
      </Columns>
    </Container>
  )
}

const ModeOption = (props: { modes: string[], title: string }) => {
  const [value, setValue] = useState<null | string>(null);
  const [dropdownOptions, setDropdownOptions] = useState<Array<DropdownOption>>(createDropdownOptions(props.modes));

  function createDropdownOptions(options: string[]): DropdownOption[] {
    return options.map(option => ({value: option}));
  }

  // Function to increment the count
  function handleChange(event: JSX.TargetedEvent<HTMLInputElement>) {
    const newValue = event.currentTarget.value;
    setValue(newValue);
    emit<ChangeModeHandler>("CHANGE_MODE", newValue);
  }

  return (
    <Stack space="small">
      <Columns>
          <Text align="left"><Muted>{props.title}</Muted></Text>
          <Dropdown onChange={handleChange} options={dropdownOptions} value={value} variant="border"/>
      </Columns>
      <VerticalSpace space="small" />
    </Stack>
  );
};

function createDropdownGroups(modes: string[]) {
  const groups = modes.reduce((acc, mode) => {
    if (["light", "dark"].includes(mode.toLowerCase())) {
      const group = acc.find(group => group.title === "Color Mode");
      const index = acc.findIndex(group => group.title === "Color Mode");
      if (!group) {
        return [...acc, {
          title: "Color Mode",
          modes: [mode]
          }
        ]
      } else {
        acc[index].modes.push(mode);
        return acc;
      }
    }
    if (["mobile", "tablet", "desktop"].includes(mode.toLowerCase())) {
      const group = acc.find(group => group.title === "Device");
      const index = acc.findIndex(group => group.title === "Device");
      if (!group) {
        return [...acc, {
          title: "Device",
          modes: [mode]
        }]
      } else {
        acc[index].modes.push(mode);
      }
    }
    return acc;
  }, [] as Group[]);
  return groups.map(group => ({
    ...group,
    value: null,
    modes: group.modes
  }));

}

export default render(Plugin)
