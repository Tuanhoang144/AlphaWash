import { useState } from "react";

import { Modal } from "../../Modal/Modal";
import BasicTableOne from "./BasicTableOne";

export function TableBasic() {
  const [modalOpen, setModalOpen] = useState(false);
  const [rows, setRows] = useState([
    {
      stt: "1",
      date: "07/08/2025",
      timeIn: "12:32",
      timeOut: "12:32",
      plateNumber: "",
      user: "",
      sdt: "0383412321",
      carCompany: "",
      vehicleLine: "",
      service: "",
      status:"in Process"
    },
    {
      stt: "1",
      date: "07/08/2025",
      timeIn: "07/08/2025",
      timeOut: "",
      plateNumber: "",
      user: "",
      sdt: "",
      carCompany: "",
      vehicleLine: "",
      service: "",
      status:"in Process"
    },
    {
      stt: "1",
      date: "07/08/2025",
      timeIn: "07/08/2025",
      timeOut: "",
      plateNumber: "",
      user: "",
      sdt: "",
      carCompany: "",
      vehicleLine: "",
      service: "",
      status:"in Process"
    },
  ]);
  const [rowToEdit, setRowToEdit] = useState(null);

  const handleDeleteRow = (targetIndex :any) => {
    setRows(rows.filter((_, idx) => idx !== targetIndex));
  };

  const handleEditRow = (idx :any) => {
    setRowToEdit(idx);

    setModalOpen(true);
  };

  const handleSubmit = (newRow :any) => {
    rowToEdit === null
      ? setRows([...rows, newRow])
      : setRows(
          rows.map((currRow, idx) => {
            if (idx !== rowToEdit) return currRow;

            return newRow;
          })
        );
  };

  return (
    <div className="App">
      <BasicTableOne rows={rows} deleteRow={handleDeleteRow} editRow={handleEditRow} />
      <button onClick={() => setModalOpen(true)} className="btn">
        Add
      </button>
      {modalOpen && (
        <Modal
          closeModal={() => {
            setModalOpen(false);
            setRowToEdit(null);
          }}
          onSubmit={handleSubmit}
          defaultValue={rowToEdit !== null && rows[rowToEdit]}
        />
      )}
    </div>
  );
}

export default TableBasic;
