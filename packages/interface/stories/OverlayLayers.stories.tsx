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
      title="在浮层中继续打开操作"
      description="在 Dialog 内打开选择面板、菜单或提示，可继续完成局部操作；子浮层显示在父浮层上方。也可以从 Popover 打开 Dialog，再进入下一层面板。Escape 按最上层逐级关闭，应用分别接收各组件的开关请求。"
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
const meta = {
  tags: ['autodocs'],
  title: 'Widgets/OverlayLayers',
  parameters: {
    docs: {
      description: {
        component:
          '浮层可以嵌套用于分层操作，例如在对话框中打开选择器或菜单。这里展示 Dialog、Popover、菜单、Tooltip 和 HoverCard 的组合：子浮层显示在父浮层上方，Escape 从最上层开始关闭。使用这些组件的 Portal 部件保留层级与主题传递，应用分别管理需要受控的 open 状态。',
      },
    },
    layout: 'fullscreen',
  },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>
export const MixedPortals: Story = { render: () => <MixedLayersExample /> }
export const NumericLayerOverride: Story = { render: () => <MixedLayersExample raised /> }
