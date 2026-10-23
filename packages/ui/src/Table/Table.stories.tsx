import { useMemo, useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from '../Button'
import { Table, type TableProps } from './'

const initial = [
  { key: '1', name: 'Bob', age: 32, address: 'Beijing, China' },
  { key: '2', name: 'Kevin', age: 42, address: 'Hangzhou, China' },
]
type Person = (typeof initial)[number]
function TableExample() {
  const [dataSource, setDataSource] = useState(initial)
  const [opened, setOpened] = useState<string | null>(null)
  // Keep column data behind a runtime boundary, away from Panda's `columns` style extraction.
  const columns = useMemo<TableProps<Person>['columns']>(
    () => [
      { title: 'Key', dataIndex: 'key', key: 'key' },
      { title: 'Name', dataIndex: 'name', key: 'name' },
      { title: 'Age', dataIndex: 'age', key: 'age' },
      { title: 'Address', dataIndex: 'address', key: 'address' },
      {
        title: 'Operation',
        key: 'operation',
        render: (_, record) => (
          <Button
            aria-label={`Delete ${record.name}`}
            size="sm"
            onClick={() => setDataSource((current) => current.filter((person) => person.key !== record.key))}>
            Delete
          </Button>
        ),
      },
    ],
    []
  )
  const tableProps: TableProps<Person> = {
    columns,
    dataSource,
    rowKey: 'key',
    caption: 'People',
    onClickRow: (person) => setOpened(person.name),
  }
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Table {...tableProps} />
      <output>Opened: {opened ?? 'None'}</output>
      <Button
        onClick={() => {
          setDataSource(initial)
          setOpened(null)
        }}>
        Reset
      </Button>
    </div>
  )
}
export default { title: 'Data/Table' } satisfies Meta
export const Overview: StoryObj = { render: () => <TableExample /> }
