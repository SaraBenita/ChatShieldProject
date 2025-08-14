import { useState } from 'react';

function MessageTable({ messages }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filtered = messages.filter((msg) => {
    const matchText = (str) => str.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      (!categoryFilter || msg.analysis.label === categoryFilter) &&
      (matchText(msg.timestamp) || matchText(msg.message) || matchText(msg.chatName) || matchText(msg.analysis.explanation))
    );
  });

  const categories = [...new Set(messages.map((msg) => msg.analysis.label))];

  return (
    <div className="mt-3">
      <div className="d-flex gap-3 mb-3">
        <input
          className="form-control"
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="form-select"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((cat, i) => (
            <option key={i} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <table className="table table-bordered table-hover">
        <thead className="table-light">
          <tr>
            <th>Phone</th>
            <th>Date</th>
            <th>Chat</th>
            <th>Message</th>
            <th>Label</th>
            <th>Explanation</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((msg, idx) => (
              <tr key={idx}>
                <td>{msg.phone}</td>
                <td>{new Date(msg.timestamp).toLocaleString()}</td>
                <td>{msg.chatName}</td>
                <td>{msg.message}</td>
                <td>{msg.analysis.label}</td>
                <td>{msg.analysis.explanation}</td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="6" className="text-center">No messages found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default MessageTable;
