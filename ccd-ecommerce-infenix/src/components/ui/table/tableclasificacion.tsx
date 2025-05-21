"use client";
//Manejar estados
import React, { useContext, useEffect, useState } from "react";
//Componentes UI
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Chip,
    User,
    Pagination,
    Selection,
    ChipProps,
    SortDescriptor,
    Tooltip,
} from "@nextui-org/react";
//Iconos
import {
    MagnifyingGlassIcon,
    TicketIcon,
    UserPlusIcon,
} from "@heroicons/react/24/solid";
//Extra
import { capitalize } from "./Utils";
/**/
import { useSession } from "next-auth/react";
import ModalCrearCursoComponent from "../modal/modalcrearcurso";
import { CheckIcon } from "@heroicons/react/16/solid";
import { TableTipoProducto } from "@/interfaces/tipoproducto.interface";
import { TableClasificacion } from "@/interfaces/tipoclasificacion.interface";

/**/

const statusOptions = [
    { name: "Active", uid: "active" },
    { name: "Paused", uid: "paused" },
    { name: "Vacation", uid: "vacation" },
];
const statusColorMap: Record<string, ChipProps["color"]> = {
    active: "success",
    paused: "danger",
    vacation: "warning",
};

const INITIAL_VISIBLE_COLUMNS = [ "Clasificacion","Naturaleza", "TipoProducto","Estado", "actions"];
export const columnsSolicitud = [
    { name: "Clasificacion", uid: "Clasificacion", sortable: true },
    { name: "Naturaleza", uid: "Naturaleza", sortable: true },
    { name: "TipoProducto", uid: "TipoProducto", sortable: true },
    { name: "Estado", uid: "Estado", sortable: true },
    { name: "ACTIONS", uid: "actions", sortable: true },
];
interface Props {
    array: TableClasificacion[];
}

export default function TableClasificacionComponent({ array }: Props) {
    const [filterValue, setFilterValue] = React.useState("");
    const [selectedKeys, setSelectedKeys] = React.useState<Selection>(
        new Set([])
    );
    const [visibleColumns, setVisibleColumns] = React.useState<Selection>(
        new Set(INITIAL_VISIBLE_COLUMNS)
    );
    const [statusFilter, setStatusFilter] = React.useState<Selection>("all");
    const [rowsPerPage, setRowsPerPage] = React.useState(15);
    const [sortDescriptor, setSortDescriptor] = React.useState<SortDescriptor>({
        column: "age",
        direction: "ascending",
    });
    const [page, setPage] = React.useState(1);

    const pages = Math.ceil(array.length / rowsPerPage);

    const hasSearchFilter = Boolean(filterValue);

    const headerColumns = React.useMemo(() => {
        if (visibleColumns === "all") return columnsSolicitud;

        return columnsSolicitud.filter((column) =>
            Array.from(visibleColumns).includes(column.uid)
        );
    }, [visibleColumns]);

    const filteredItems = React.useMemo(() => {
        let filteredUsers = [...array];

        if (hasSearchFilter) {
            const lowerCaseFilterValue = filterValue.toLowerCase();

            filteredUsers = filteredUsers.filter(
                (user) =>
                (user.TipoProducto &&
                    user.TipoProducto.toLowerCase().includes(lowerCaseFilterValue))
            );
        }
        if (
            statusFilter !== "all" &&
            Array.from(statusFilter).length !== statusOptions.length
        ) {
            filteredUsers = filteredUsers.filter((user) =>
                Array.from(statusFilter).includes(user.TipoProducto)
            );
        }

        return filteredUsers;
    }, [array, filterValue, statusFilter]);

    const items = React.useMemo(() => {
        const start = (page - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        return filteredItems.slice(start, end);
    }, [page, filteredItems, rowsPerPage]);

    const sortedItems = React.useMemo(() => {
        return [...items].sort((a: TableClasificacion, b: TableClasificacion) => {
            const first = a[sortDescriptor.column as keyof TableClasificacion] as number;
            const second = b[sortDescriptor.column as keyof TableClasificacion] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor.direction === "descending" ? -cmp : cmp;
        });
    }, [sortDescriptor, items]);

    const renderCell = React.useCallback((user: TableClasificacion, columnKey: React.Key) => {
        const cellValue = user[columnKey as keyof TableClasificacion];

        switch (columnKey) {

            case "Estado":
                return (
                    <>
                        {user.Estado_id == "1" ? (<Chip
                            startContent={<CheckIcon />}
                            variant="faded"
                            color="success"
                        >
                            Activo
                        </Chip>) : ""}
                        {user.Estado_id == "2" ? (<Chip
                            startContent={<CheckIcon />}
                            variant="faded"
                            color="danger"
                        >
                            Inactivo
                        </Chip>) : ""}
                    </>


                );
            case "actions":
                return (
                    <div className="relative flex items-center gap-2">

                    </div>
                );
            default:
                return cellValue;
        }
    }, []);

    const onRowsPerPageChange = React.useCallback(
        (e: React.ChangeEvent<HTMLSelectElement>) => {
            setRowsPerPage(Number(e.target.value));
            setPage(1);
        },
        []
    );

    const onSearchChange = React.useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
            setPage(1);
        } else {
            setFilterValue("");
        }
    }, []);

    const topContent = React.useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    <Input
                        isClearable
                        classNames={{
                            base: "w-full sm:max-w-[44%]",
                            inputWrapper: "border-1",
                        }}
                        placeholder="Buscar"
                        size="sm"
                        startContent={<MagnifyingGlassIcon className="h-5" />}
                        value={filterValue}
                        variant="bordered"
                        onClear={() => setFilterValue("")}
                        onValueChange={onSearchChange}
                    />
                    <div className="flex gap-3">
                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button
                                    endContent={<TicketIcon className="h-5" />}
                                    size="sm"
                                    variant="flat"
                                >
                                    Columnas
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columnsSolicitud.map((column) => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {capitalize(column.name)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                        <ModalCrearCursoComponent />
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-default-400 text-small">
                        Total {array.length} equipos
                    </span>
                    <label className="flex items-center text-default-400 text-small">
                        Filas por página:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                        >
                            <option value="5">5</option>
                            <option value="10">10</option>
                            <option value="15">15</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        statusFilter,
        visibleColumns,
        onSearchChange,
        onRowsPerPageChange,
        array.length,
        hasSearchFilter,
    ]);

    const bottomContent = React.useMemo(() => {
        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <Pagination
                    showControls
                    classNames={{
                        cursor: "bg-foreground text-background",
                    }}
                    color="default"
                    isDisabled={hasSearchFilter}
                    page={page}
                    total={pages}
                    variant="light"
                    onChange={setPage}
                />
                <span className="text-small text-default-400">
                    {selectedKeys === "all"
                        ? "Todos los items seleccionados"
                        : `${selectedKeys.size} de ${items.length} seleccionados`}
                </span>
            </div>
        );
    }, [selectedKeys, items.length, page, pages, hasSearchFilter]);

    const classNames = React.useMemo(
        () => ({
            table: ["bg-[var(--color-peru)] rounded-xl"],
            wrapper: ["max-h-[382px]"],
            th: [
                "bg-[var(--color-peru)]",
                "font-bold  text-xs",
                "border-b",
                "border-divider",
            ],
            td: [
                // changing the rows border radius
                // first
                "",
                "group-data-[first=true]:first:before:rounded-none",
                "group-data-[first=true]:last:before:rounded-none",
                // middle
                "group-data-[middle=true]:before:rounded-none",
                // last
                "group-data-[last=true]:first:before:rounded-none",
                "group-data-[last=true]:last:before:rounded-none",
            ],
        }),
        []
    );

    return (
        <>
            <Table
                isCompact
                aria-label="Example table with custom cells, pagination and sorting"
                bottomContent={bottomContent}
                bottomContentPlacement="outside"
                checkboxesProps={{
                    classNames: {
                        wrapper:
                            "after:bg-foreground after:text-background text-background",
                    },
                }}
                classNames={classNames}
                selectedKeys={selectedKeys}
                selectionMode="multiple"
                sortDescriptor={sortDescriptor}
                topContent={topContent}
                topContentPlacement="outside"
                onSelectionChange={setSelectedKeys}
                onSortChange={setSortDescriptor}
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.uid}
                            align={column.uid === "actions" ? "center" : "start"}
                            allowsSorting={column.sortable}
                        >
                            {column.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"No users found"} items={sortedItems}>
                    {(item: TableClasificacion) => (
                        <TableRow key={item.IdClasificacion}>
                            {(columnKey) => (
                                <TableCell>{renderCell(item, columnKey)}</TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </>
    );
}
