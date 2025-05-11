const EditUser = ({ formData, handleInputChange, handleSubmit, onCancel }) => {
    return (
      <form className="flex flex-col gap-4 mt-4" onSubmit={handleSubmit}>
        <div className="flex flex-col mt-4">
          <label htmlFor="username" className="text-left text-white font-bold mb-1">New Username</label>
          <input 
            type="text" 
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="New Username" 
            className="p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col mt-4">
          <label htmlFor="email" className="text-left text-white font-bold mb-1">New Email</label>
          <input 
            type="email" 
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="New Email" 
            className="p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex flex-col mt-4">
          <label htmlFor="password" className="text-left text-white font-bold mb-1">New Password</label>
          <input 
            type="password" 
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="New Password" 
            className="p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
          />
        </div>
        <div className="flex justify-between mt-4">
          <button 
            type="submit" 
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-md transition"
          >
            Save
          </button>
          <button 
            type="button" 
            className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-bold rounded-md transition"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    );
  };
  
  export default EditUser;