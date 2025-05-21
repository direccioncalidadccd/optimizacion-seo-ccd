import React, { useContext, useEffect, useState } from "react";
import { Checkbox, CheckboxGroup, Select, SelectItem } from "@nextui-org/react";
import axios from 'axios';
import { environment } from '@/environments/environment';
interface Props {

    value: any;
    onChange: (value: any) => void;
}

export default function CheckboxGroupComponent({

    value,
    onChange,
}: Props) {

    const api = axios.create({
        baseURL: environment.baseUrl,
        headers: { "Content-Type": "application/json" },
    });
    const [dataacreditacion, setdataacreditacion] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.post("/inicio/listaradministraracreditacionv2");
                setdataacreditacion(response.data.data[0]);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        fetchData();
    }, []);
    return (
        <div className="flex w-full flex-col gap-2">
            <CheckboxGroup
                onChange={(keys) => onChange(Array.from(keys))}
                value={value}
                label="Selecciona las acreditaciones"
                color="warning"
            >
                {dataacreditacion.map((item: any) => (
                    <>
                        <Checkbox key={item.IdAcreditacion.toString()} value={item.IdAcreditacion.toString()}>
                            {item.Acreditacion}
                        </Checkbox>
                    </>
                ))}

            </CheckboxGroup>
        </div>
    );
}
