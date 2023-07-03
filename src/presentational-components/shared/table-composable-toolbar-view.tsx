import React, { Fragment } from 'react';
import { useIntl } from 'react-intl';
import messages from '../../Messages';
import { TableVariant, TableComposable, Thead, Tr, Th, Tbody, Td } from '@patternfly/react-table';
import TableToolbar from '@redhat-cloud-services/frontend-components/TableToolbar';
import { Button, Pagination, EmptyStatePrimary } from '@patternfly/react-core';
import { ListLoader } from './loader-placeholders';
import { PlusCircleIcon } from '@patternfly/react-icons';
import Toolbar, { paginationBuilder } from './toolbar';
import EmptyWithAction from './empty-state';
import './table-toolbar-view.scss';
import { ISortBy, OnSort } from '@patternfly/react-table';
import { CellObject, RowProps } from '../../smart-components/user/user-table-helpers';

interface FilterProps {
  username?: string;
  email?: string;
  status?: string;
}

interface PaginationProps {
  limit?: number;
  offset?: number;
  count?: number;
  noBottom?: boolean;
}

// TODO: make it clear later and remove FetchDataProps from below
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface FetchDataPropsNew {
  pagination?: PaginationProps;
  filters?: FilterProps;
  orderBy?: string;
}

interface FetchDataProps {
  limit?: number;
  offset?: number;
  count?: number;
  noBottom?: boolean;

  filters?: FilterProps;
  orderBy?: string; // TODO: make required later

  username?: string;
  email?: string;
  status?: string;
}

function isCellObject(cell: any): cell is CellObject {
  return typeof cell === 'object' && typeof cell.title !== 'undefined';
}

interface TableProps {
  isCompact?: boolean;
  borders: boolean;
  columns: Array<{ title: string; key?: string; sortable?: boolean }>;
  rows: Array<RowProps>;
  data?: Array<unknown>; // used only in toolbar for selectable items
  toolbarButtons?: () => Array<unknown>;
  title: { singular: string; plural: string };
  pagination: { limit?: number; offset?: number; count?: number; noBottom?: boolean };
  filterValue?: string;
  emptyFilters: FilterProps;
  setFilterValue: (value: FilterProps) => void;
  isLoading: boolean;
  isSelectable?: boolean;
  fetchData: (config: FetchDataProps) => void;
  emptyProps?: unknown;
  rowWrapper?: any;
  filterPlaceholder?: string;
  filters: Array<{
    value: string | number | Array<unknown>;
    key: string;
    placeholder?: string;
    innerRef?: React.RefObject<HTMLInputElement | HTMLTextAreaElement>;
    label?: string;
    type?: any;
    items?: any;
  }>;
  isFilterable?: boolean;
  onShowMore?: () => void;
  showMoreTitle?: string;
  onFilter?: () => void;
  onChange?: () => void;
  value?: unknown;
  sortBy: ISortBy; // { index: number; direction: 'asc' | 'desc'; defaultDirection?: 'asc' | 'desc'; }
  onSort: OnSort;
  isExpandable?: boolean;
  hideFilterChips?: boolean;
  hideHeader?: boolean;
  noData?: boolean;
  noDataDescription?: Array<React.ReactNode>;
  ouiaId: string;
  tableId?: string;
  textFilterRef?: undefined;
}

export const TableComposableToolbarView = ({
  isCompact = false,
  borders,
  columns,
  rows,
  data,
  toolbarButtons,
  title,
  pagination,
  filterValue,
  isLoading,
  emptyFilters,
  setFilterValue,
  isSelectable = false,
  fetchData,
  emptyProps,
  filterPlaceholder,
  filters,
  isFilterable,
  onShowMore,
  showMoreTitle,
  onFilter,
  onChange,
  value,
  sortBy,
  onSort,
  hideFilterChips,
  noData,
  noDataDescription,
  ouiaId,
  tableId,
  textFilterRef,
}: TableProps) => {
  const intl = useIntl();

  const renderEmpty = () => (
    <EmptyWithAction
      title={intl.formatMessage(messages.noMatchingItemsFound, { items: title.plural })}
      description={
        noData && noDataDescription
          ? noDataDescription
          : [intl.formatMessage(messages.filterMatchesNoItems, { items: title.plural }), intl.formatMessage(messages.tryChangingFilters)]
      }
      actions={
        noData && noDataDescription
          ? undefined
          : [
              <EmptyStatePrimary key="clear-filters">
                <Button
                  variant="link"
                  ouiaId="clear-filters-button"
                  onClick={() => {
                    setFilterValue(emptyFilters);
                    fetchData({
                      ...pagination,
                      offset: 0,
                      ...(emptyFilters ? emptyFilters : { name: '' }),
                    });
                  }}
                >
                  {intl.formatMessage(messages.clearAllFilters)}
                </Button>
              </EmptyStatePrimary>,
            ]
      }
    />
  );

  const renderTable = () => {
    const orderBy = sortBy?.index ? `${sortBy?.direction === 'desc' ? '-' : ''}${columns[sortBy.index]?.key}` : undefined;
    return (
      <Fragment>
        <Toolbar
          isSelectable={isSelectable}
          isLoading={isLoading || noData}
          data={data}
          titleSingular={title.singular}
          filterValue={filterValue}
          setFilterValue={setFilterValue}
          sortBy={orderBy}
          pagination={pagination}
          fetchData={fetchData}
          toolbarButtons={toolbarButtons}
          filterPlaceholder={filterPlaceholder}
          filters={filters}
          isFilterable={isFilterable}
          onShowMore={onShowMore}
          showMoreTitle={showMoreTitle}
          onFilter={onFilter}
          onChange={onChange}
          value={value}
          hideFilterChips={hideFilterChips}
          tableId={tableId}
          textFilterRef={textFilterRef}
        />
        {isLoading ? (
          <ListLoader isCompact={isCompact} items={pagination?.limit} />
        ) : (
          <TableComposable
            aria-label={`${title.plural.toLowerCase()} table`}
            variant={isCompact ? TableVariant.compact : undefined}
            borders={borders}
            ouiaId={ouiaId} // [PF]: Value to overwrite the randomly generated data-ouia-component-id
          >
            <Thead>
              <Tr>
                {columns.map((column, i) => (
                  <Th key={i} sort={column?.sortable ? { columnIndex: i, sortBy, onSort } : undefined}>
                    {column.title}
                  </Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {rows?.length > 0 ? (
                rows?.map((row, i) => (
                  <Tr key={i}>
                    {row.cells.map((cell, j) => (
                      <Td key={j} dataLabel={columns[j].title}>
                        {/* TODO: make more general */}
                        {isCellObject(cell) ? cell.title : cell}
                      </Td>
                    ))}
                  </Tr>
                ))
              ) : (
                <Tr>
                  {/* render one component full width for the entire row */}
                  <Td colSpan={columns.length}>{renderEmpty()}</Td>
                </Tr>
              )}
            </Tbody>
          </TableComposable>
        )}
        {!pagination.noBottom && (
          <TableToolbar>
            {!isLoading && <Pagination {...paginationBuilder(pagination, fetchData, filterValue, orderBy)} variant="bottom" dropDirection="up" />}
          </TableToolbar>
        )}
      </Fragment>
    );
  };

  return (
    <Fragment>
      {!isLoading && rows?.length === 0 && filterValue?.length === 0 && filters.every(({ value }) => !value) ? (
        <EmptyWithAction
          title={intl.formatMessage(messages.configureItems, { items: title.plural })}
          icon={PlusCircleIcon}
          description={[
            intl.formatMessage(messages.toConfigureUserAccess),
            intl.formatMessage(messages.createAtLeastOneItem, { item: title.singular }),
          ]}
          actions={toolbarButtons ? toolbarButtons()[0] : false}
          {...(typeof emptyProps === 'object' ? emptyProps : {})}
        />
      ) : (
        renderTable()
      )}
    </Fragment>
  );
};
