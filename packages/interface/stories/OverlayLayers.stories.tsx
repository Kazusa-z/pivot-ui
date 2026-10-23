import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Dialog } from '../src/widgets/dialogs'
import { Popover, Tooltip, TooltipProvider, HoverCard } from '../src/widgets/overlays'
import {
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../src/widgets/menus'
import { Button } from '../src/widgets/buttons'
import { css } from '../styled-system/css'
import { ContractFrame, ControlInput, StatePanel, contractStyles } from './support/ContractFrame'

function MixedLayersExample({ raised = false }: { raised?: boolean }) {
  const [generation, setGeneration] = useState(0)
  const [actions, setActions] = useState(0)
  return (
    <ContractFrame
      title="Portals inherit overlay layers"
      description="Dialog 内打开 Popover、菜单/子菜单、Tooltip 和 HoverCard，子浮层应在父浮层上方。反方向先开 Popover 再开 Dialog 也遵守同一层级。Escape 按最上层逐级关闭。"
      onReset={() => {
        setGeneration((value) => value + 1)
        setActions(0)
      }}>
      <TooltipProvider delayDuration={100}>
        <div key={generation} className={contractStyles.row}>
          <Dialog
            title="Parent dialog"
            trigger={<Button>Dialog with child overlays</Button>}
            contentProps={raised ? { css: css.raw({ zIndex: 200 }) } : undefined}>
            <div className={contractStyles.stack}>
              <Popover trigger={<Button>Child popover</Button>}>
                <ControlInput aria-label="Nested popover field" defaultValue="Popover above dialog" />
              </Popover>
              <DropdownMenuRoot>
                <DropdownMenuTrigger asChild>
                  <Button>Child menu</Button>
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent>
                    <DropdownMenuItem onSelect={() => setActions((value) => value + 1)}>Direct action</DropdownMenuItem>
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger>Child submenu</DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onSelect={() => setActions((value) => value + 1)}>
                            Nested action
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenuRoot>
              <Tooltip trigger={<Button>Child tooltip</Button>}>Tooltip above dialog</Tooltip>
              <HoverCard
                trigger={
                  <a href="#preview" onClick={(event) => event.preventDefault()}>
                    Child hover preview
                  </a>
                }
                rootProps={{ openDelay: 100 }}>
                Hover preview above dialog
              </HoverCard>
            </div>
          </Dialog>
          <Popover trigger={<Button>Popover with child dialog</Button>}>
            <Dialog title="Dialog above popover" trigger={<Button>Open child dialog</Button>}>
              <Popover trigger={<Button>Third layer popover</Button>}>
                <ControlInput aria-label="Third layer field" defaultValue="Above both parents" />
              </Popover>
            </Dialog>
          </Popover>
        </div>
      </TooltipProvider>
      <StatePanel
        label="Layer interaction state"
        value={{ actions, parentDialogLayer: raised ? 200 : 50, nextLayer: raised ? 210 : 60 }}
      />
    </ContractFrame>
  )
}
const meta = { title: 'Widgets/OverlayLayers', parameters: { layout: 'fullscreen' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const MixedPortals: Story = { render: () => <MixedLayersExample /> }
export const NumericLayerOverride: Story = { render: () => <MixedLayersExample raised /> }
