// File: lib/mock.ts
import axios from "axios";
import MockAdapter from "axios-mock-adapter";

export const api = axios.create({
  baseURL: "/api",
});

const mock = new MockAdapter(api, { delayResponse: 500 });

let mockData = [
  {
    serviceTypeCode: "ST001",
    serviceTypeName: "Bảo dưỡng",
    serviceCode: "S001",
    serviceName: "Thay dầu",
    price: 500000,
    duration: "60",
    size: "M",
    note: "Dầu cao cấp",
  },
  {
    serviceTypeCode: "ST002",
    serviceTypeName: "Vệ sinh",
    serviceCode: "S001",
    serviceName: "Rửa xe",
    price: 100000,
    duration: "20",
    size: "S",
    note: "Rửa nhanh",
  },
];

mock.onGet("/services").reply(200, mockData);

mock.onPost("/services").reply((config) => {
  const newService = JSON.parse(config.data);
  mockData.push(newService);
  return [200, newService];
});
