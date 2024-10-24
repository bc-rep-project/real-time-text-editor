import React from 'react';

const UserPresenceIndicator = ({ activeUsers }) => {
  return (
    <div className="flex items-center space-x-2">
      {activeUsers.map((user, index) => (
        <div
          key={index}
          className="w-3 h-3 rounded-full bg-green-500"
          title={user.username}
        ></div>
      ))}
    </div>
  );
};

export default UserPresenceIndicator;
