import React, { useState } from 'react';
import axios from 'axios';

const CreateCommunityForm = ({ onCreated }) => {
  const [form, setForm] = useState({ name: '', description: '', interests: '', rules: '' });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await axios.post('/community/create', {
      ...form,
      interests: form.interests.split(',').map(i => i.trim()),
      rules: form.rules.split('\n').map(r => r.trim()),
    });
    onCreated(res.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input name="name" placeholder="Name" onChange={handleChange} required className="border p-2 rounded w-full"/>
      <textarea name="description" placeholder="Description" onChange={handleChange} required className="border p-2 rounded w-full"/>
      <input name="interests" placeholder="Interests (comma separated)" onChange={handleChange} className="border p-2 rounded w-full"/>
      <textarea name="rules" placeholder="Community Rules (one per line)" onChange={handleChange} className="border p-2 rounded w-full"/>
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Community</button>
    </form>
  );
};

export default CreateCommunityForm;
