import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";

import "./BasicTableOne.css";

export default function TableBasic({ rows, deleteRow, editRow }: any) {
  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>STT</th>
            <th>Ngày</th>
            <th>Thời Gian Vào</th>
            <th>Thồi Gian Ra</th>
            <th>Biển số xe</th>
            <th>Tên Khách</th>
            <th>Số điện thoại</th>
            <th>Hãng xe</th>
            <th className="expand">Dòng Xe</th>
            <th>Dịch Vụ</th>
            <th>Nhân Viên</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, idx: any) => {
            const statusText =
              row.status.charAt(0).toUpperCase() + row.status.slice(1);

            return (
              <tr key={idx}>
                <td>{row.stt}</td>
                <td className="expand">{row.date}</td>
                <td className="expand">{row.timeIn}</td>
                <td className="expand">{row.timeOut}</td>
                <td className="expand">{row.plateNumber}</td>
                <td className="expand">{row.user}</td>
                <td className="expand">{row.sdt}</td>
                <td className="expand">{row.carCompany}</td>
                <td className="expand">{row.vehicleLine}</td>
                <td className="expand">{row.service}</td>
                <td>
                  <span className={`label label-${row.status}`}>
                    {statusText}
                  </span>
                </td>
                <td className="fit">
                  <span className="actions">
                    <BsFillTrashFill
                      className="delete-btn"
                      onClick={() => deleteRow(idx)}
                    />
                    <BsFillPencilFill
                      className="edit-btn"
                      onClick={() => editRow(idx)}
                    />
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
