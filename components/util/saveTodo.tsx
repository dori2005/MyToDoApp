
type TodoData = {
    text:string,
    working:boolean,
    complete:boolean,
  };
  
const updateStack = {
    'create' : {},
    'update' : {},
    'delete' : {},
  };
    // save server db
  const saveAddToDos = async (sendData:TodoData) => {
    await fetch('http://localhost:3000/test2', {
      method: "POST",
      headers: {
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(sendData)
    })
    .then((response) => {
      if (response.status === 200) {
        console.log("저장완료");
      } else if (response.status === 403) {
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error message:', error.message);
    })
  };
  
  const saveDeleteToDos = async (sendData:TodoData) => {
    await fetch('http://localhost:3000/test2', {
      method: "DELETE",
      headers: {
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(sendData)
    })
    .then((response) => {
      if (response.status === 200) {
        console.log("저장완료");
      } else if (response.status === 403) {
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error message:', error.message);
    })
  };
  
  const saveEditToDos = async (sendData) => {
    console.log(sendData);
    await fetch('http://localhost:3000/test2', {
      method: "PATCH",
      headers: {
        'Content-Type' : 'application/json',
      },
      body: JSON.stringify(sendData)
    })
    .then((response) => {
      if (response.status === 200) {
        console.log("저장완료");
      } else if (response.status === 403) {
        return response.json();
      }
    })
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.error('Error message:', error.message);
    })
  };
  
  //todo key를 통해 최종적인 todo를 설정
  const renewUpdate = (flag:number, key:string, data:TodoData) => {
    if (updateStack === undefined)
        return null;
    // 0 - todo 생성
    // 1 - todo 수정
    // 2 - todo 삭제
    let count = 0;
    if(flag == 0) {
      updateStack.create[key] = data;
    }else if (flag == 1) {
      if(updateStack.create[key]) 
        updateStack.create[key] = data;
      else 
        updateStack.update[key] = data;
    }else if (flag == 2) {
      if(updateStack.create[key]) {
        delete updateStack.create[key];
      }else {
        updateStack.delete[key] = true;
      }
      if(updateStack.update[key]) {
        delete updateStack.update[key];
      }      
    }
    count += Object.keys(updateStack.create).length;
    count += Object.keys(updateStack.update).length;
    count += Object.keys(updateStack.delete).length;
    if (count > 5)
      saveUpdate();
    console.log(updateStack);
  }
  
  const saveUpdate = () => {
    if( Object.keys(updateStack.create).length != 0 ) {
      saveAddToDos(updateStack.create);
      updateStack.create = {};
    }
    if( Object.keys(updateStack.update).length != 0 ) {
      saveEditToDos(updateStack.update);
      updateStack.update = {};
    }
    if( Object.keys(updateStack.delete).length != 0 ) {
      saveDeleteToDos(updateStack.delete);
      updateStack.delete = {};
    }
    console.log(updateStack);
  }
    
  module.exports = {
      renewUpdate,
      saveUpdate
  }