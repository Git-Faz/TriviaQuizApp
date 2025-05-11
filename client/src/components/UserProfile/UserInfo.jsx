const UserInfo = ({ username, email }) => {
    return (
      <div id="userInfo">
        <h2 className="text-4xl font-bold mb-4">{username}</h2>
        <h4 className="mt-2"><strong>{email}</strong></h4>
      </div>
    );
  };
  
  export default UserInfo;