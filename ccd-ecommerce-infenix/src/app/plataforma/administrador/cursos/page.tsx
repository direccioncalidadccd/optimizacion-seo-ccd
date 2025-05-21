"use client";
import React, { useEffect, useState } from "react";
import { Tabs, Tab, Card, CardBody } from "@nextui-org/react";
import TableProductoComponent from "@/components/ui/table/tableproducto";
import axios from "axios";
import { environment } from "@/environments/environment";
import TableAcreditacionComponent from "@/components/ui/table/tableacreditacion";

export default function TabGestionEquipo() {
    const [selectedTab, setSelectedTab] = useState(1); // Estado para el índice de la pestaña seleccionada
    const [dataproducto, setProducto] = useState([]);
    const [dataacreditacion, setdataacreditacion] = useState([]);

    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.post("/inicio/listaradministrarcursosv2");
                setProducto(response.data.data[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    const handleTabChange = async (key: any) => {
        setSelectedTab(key);
        let response;

        switch (Number(key)) {
            case 1:
                break;
            case 2:
                if (dataacreditacion.length === 0) {
                    const response = await api.post("/inicio/listaradministraracreditacionv2");
                    setdataacreditacion(response.data.data[0]);
                } else {
                }
                break;
            
        }
    };
    return (
        <div className="flex w-full flex-col py-6">
            <div className="">
                <Tabs
                    disabledKeys={["music"]}
                    selectedKey={selectedTab}
                    onSelectionChange={handleTabChange}
                >
                    <Tab key="1" title="Curso">
                        <Card>
                            <CardBody>
                                <TableProductoComponent array={dataproducto} setarray={setProducto} />
                            </CardBody>
                        </Card>
                    </Tab>
                    <Tab key="2" title="Acreditacion">
                        <Card>
                            <CardBody>
                                <TableAcreditacionComponent array={dataacreditacion} setarray={setdataacreditacion} />
                            </CardBody>
                        </Card>
                    </Tab>
                </Tabs>
            </div>
        </div>
    );
}
