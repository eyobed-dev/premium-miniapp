import React from 'react';

const OrderTable = ({ orders }) => {
  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Service</th>
          <th>User</th>
          <th>Email</th>
          <th>Amount</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {/* TODO: Render order rows */}
      </tbody>
    </table>
  );
};

export default OrderTable; 