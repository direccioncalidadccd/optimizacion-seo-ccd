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
import { MdModeEdit } from "react-icons/md";
import ModalEditarCursoComponent from "../modal/modaleditarcurso";
import { Curso } from "@/interfaces/curso.interface";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import axios from 'axios';
import { environment } from '@/environments/environment';
import { Acreditacion } from "@/interfaces/acreditacion.interface";
import ModalCrearAcreditacion from "../modal/modalcrearacreditacion";
import ModalEditarAcreditacion from "../modal/modaleditaracreditacion";
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

const INITIAL_VISIBLE_COLUMNS = ["Acreditacion", "Codigo", "Precio", "Foto", "actions"];
export const columnsSolicitud = [
  { name: "Acreditacion", uid: "Acreditacion", sortable: true },
  { name: "Codigo", uid: "Codigo", sortable: true },
  { name: "Precio", uid: "Precio", sortable: true },
  { name: "Foto", uid: "Foto", sortable: true },
  { name: "ACTIONS", uid: "actions", sortable: true },
];
interface Props {
  array: Acreditacion[];
  setarray:any
}

export default function TableAcreditacionComponent({ array,setarray }: Props) {
  const api = axios.create({
    baseURL: environment.baseUrl,
    headers: { "Content-Type": "application/json" },
  });
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
        (user.Acreditacion &&
          user.Acreditacion.toLowerCase().includes(lowerCaseFilterValue))
      );
    }
    if (
      statusFilter !== "all" &&
      Array.from(statusFilter).length !== statusOptions.length
    ) {
      filteredUsers = filteredUsers.filter((user) =>
        Array.from(statusFilter).includes(user.Acreditacion)
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
    return [...items].sort((a: Acreditacion, b: Acreditacion) => {
      const first = a[sortDescriptor.column as keyof Acreditacion] as number;
      const second = b[sortDescriptor.column as keyof Acreditacion] as number;
      const cmp = first < second ? -1 : first > second ? 1 : 0;

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  async function cambiarestado(estado: any, id: any) {
    const MySwal = withReactContent(Swal);
    MySwal.fire({
      title: "Cambio de estado",
      text: "Desea cambiar de estado?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí",
      allowOutsideClick: false,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const response = await api.post("/inicio/cambiarestadoadmincursosv2", {
          fcurso_id:id,
          festado_id:estado,
        });
        const response1 = await api.post("/inicio/listaradministrarcursosv2");
        setarray(response1.data.data[0]);
      }
    });
  }

  const renderCell = React.useCallback((user: Acreditacion, columnKey: React.Key) => {
    const cellValue = user[columnKey as keyof Acreditacion];

    switch (columnKey) {
    
     
      case "actions":
        return (
          <div className="relative flex items-center gap-2">
            {user.Estado_id == '1' ? (<ModalEditarAcreditacion setarray={setarray}  array={{ IdAcreditacion: user.IdAcreditacion,Acreditacion:user.Acreditacion,Codigo:user.Codigo,Precio:user.Precio }} />) : (<></>)}
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
            <ModalCrearAcreditacion  setarray={setarray}/>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-default-400 text-small">
            Total {array.length} cursos
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
          {(item: Acreditacion) => (
            <TableRow key={item.IdAcreditacion}>
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
