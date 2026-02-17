import { Payment, Sale, Customer, Agent } from '@/lib/db';

interface ReceiptProps {
  payment: Payment;
  sale: Sale;
  customer: Customer;
  agent: Agent;
}

export default function Receipt({ payment, sale, customer, agent }: ReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-4 bg-white border rounded shadow-md max-w-sm mx-auto print:shadow-none">
      <h2 className="text-xl font-bold text-center">Payment Receipt</h2>
      <p className="text-center text-gray-600">Enterprise EMI</p>
      <hr className="my-2" />
      <div className="space-y-1">
        <p><span className="font-semibold">Date:</span> {new Date(payment.collectedAt).toLocaleString()}</p>
        <p><span className="font-semibold">Customer:</span> {customer.name}</p>
        <p><span className="font-semibold">Customer ID:</span> {customer.customerNumber}</p>
        <p><span className="font-semibold">Village:</span> {customer.villageId}</p>
        <p><span className="font-semibold">Amount:</span> ₹{payment.amount}</p>
        <p><span className="font-semibold">Collected by:</span> {agent.name}</p>
      </div>
      <hr className="my-2" />
      <button onClick={handlePrint} className="w-full bg-blue-500 text-white py-2 rounded print:hidden">
        Print Receipt
      </button>
    </div>
  );
}