import React, { useState } from "react";

import "./Modal.css";

export function Modal({ closeModal, onSubmit, defaultValue }: any) {
  const [formState, setFormState] = useState(
    defaultValue || {
      stt: "1",
      date: "This is the main page of the website",
      timeIn: "07/08/2025",
      timeOut: "",
      plateNumber: "",
      user: "",
      sdt: "",
      carCompany: "",
      vehicleLine: "",
      service: "",
      status: "in Process"
    }
  );
  const [errors, setErrors] = useState("");

  const validateForm = () => {
    if (formState.stt && formState.date && formState.timeIn && formState.timeOut &&
      formState.plateNumber && formState.user && formState.sdt && formState.carCompany
      && formState.vehicleLine && formState.service && formState.status) {
      setErrors("");
      return true;
    } else {
      let errorFields = [];
      for (const [key, value] of Object.entries(formState)) {
        if (!value) {
          errorFields.push(key);
        }
      }
      setErrors(errorFields.join(", "));
      return false;
    }
  };

  const handleChange = (e: any) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();

    if (!validateForm()) return;

    onSubmit(formState);

    closeModal();
  };

  return (
    <div
      className="modal-container"
      onClick={(e: any) => {
        if (e?.target?.className === "modal-container") closeModal();
      }}
    >
      <div className="modal">
        <form>
          <div className="form-group">
            <label htmlFor="stt">STT</label>
            <input name="stt" onChange={handleChange} value={formState.stt} />
          </div>
          <div className="form-group">
            <label htmlFor="date">Date</label>
            <textarea
              name="date"
              onChange={handleChange}
              value={formState.date}
            />
          </div>
          <div className="form-group">
            <label htmlFor="timeIn">timeIn</label>
            <textarea
              name="timeIn"
              onChange={handleChange}
              value={formState.timeIn}
            />
          </div>
          <div className="form-group">
            <label htmlFor="timeOut">timeOut</label>
            <textarea
              name="timeOut"
              onChange={handleChange}
              value={formState.timeOut}
            />
          </div>
          <div className="form-group">
            <label htmlFor="plateNumber">plateNumber</label>
            <textarea
              name="plateNumber"
              onChange={handleChange}
              value={formState.plateNumber}
            />
          </div>
          <div className="form-group">
            <label htmlFor="user">user</label>
            <textarea
              name="user"
              onChange={handleChange}
              value={formState.user}
            />
          </div>
          <div className="form-group">
            <label htmlFor="sdt">sdt</label>
            <textarea
              name="sdt"
              onChange={handleChange}
              value={formState.sdt}
            />
          </div>
          <div className="form-group">
            <label htmlFor="carCompany">carCompany</label>
           <select
              name="carCompany"
              onChange={handleChange}
              value={formState.carCompany}
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="vehicleLine">vehicleLine</label>
            <select
              name="vehicleLine"
              onChange={handleChange}
              value={formState.vehicleLine}
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="service">service</label>
            <select
              name="service"
              onChange={handleChange}
              value={formState.service}
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              name="status"
              onChange={handleChange}
              value={formState.status}
            >
              <option value="live">Live</option>
              <option value="draft">Draft</option>
              <option value="error">Error</option>
            </select>
          </div>
          {errors && <div className="error">{`Please include: ${errors}`}</div>}
          <button type="submit" className="btn" onClick={handleSubmit}>
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};
