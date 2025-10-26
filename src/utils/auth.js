import router from "@/router";

  export function getToken() {
    return localStorage.getItem('token'); // 从 localStorage 获取 token
  }
  
  export function setToken(token) {
    localStorage.setItem('token', token); // 将 token 存入 localStorage
  }
  
  export function removeToken() {
    localStorage.removeItem('token'); // 移除 token
  }

  export const getLocalUser = (key, defaultValue) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.log(error);
      router.push('/home');
      return defaultValue;
    }
  }

//将json列表数据复制给新列表，并为每条数据新建自增id属性
  export function setId(ori){
    const tar=ori.map((item,index)=>({
      ...item,
      id:index+1
  }));
  return tar;
}

// 格式化时间
export const formatTime = (date) => {
  if (!date) return "";
  const updateTime = new Date(date);
  const now = new Date();
  const diff = now - updateTime;
  console.log(now," ",updateTime," ",diff);
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}天前`;
  if (hours > 0) return `${hours}小时前`;
  if (minutes > 0) return `${minutes}分钟前`;
  return "刚刚";
};

// 生成随机颜色
export const getRandomColor = (str) => {
  const colors = [
    "#55cada",
    "#78a8cf",
    "#4895ef",
    "#4cc9f0",
    "#7209b7",
    "#560bad",
    "#480ca8",
    "#3a0ca3",
    "#db95b5",
    "#e989da",
    "#c682f3",
    "#b38fdb",
    "#4cc9f0",
    "#456d9c",
    "#6a82f0",
    "#6f6ade",
  ];
  const index = str.charCodeAt(0) % colors.length;
  return colors[index];
};

// 获取用户名的首字母
export const getInitials = (name) => {
  return name.length > 0 ? name.charAt(0) : "?";
};