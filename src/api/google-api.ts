const fileName = 'better-chatgpt.json';

const setNextReloginTimeout = (action: Function) => {
  setTimeout(action, 1000);
}

const reLogin = () => {
  document.getElementById('settings')?.click()
  setNextReloginTimeout(() => {
    document.getElementById('logout')?.click();
    setNextReloginTimeout(() => {
      document.getElementById('login')?.click();
      setNextReloginTimeout(() => {
        document.getElementById('settings_modal_close')?.click();
      })
    })
  });
}

export const searchFile = async (accessToken: string) => {
  const res = await fetch(
    `https://content.googleapis.com/drive/v3/files?q=name+%3d+%27${fileName}%27`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) {
    reLogin();
    return null;
  }
  return await res.json();
}

export const createFile = async (accessToken: string, fileContent: string) => {
  var file = new Blob([fileContent], { type: 'text/plain' });
  var metadata = {
    'name': fileName, // Filename at Google Drive
    'title': fileName,
    'mimeType': 'text/plain', // mimeType at Google Drive
    'parents': ['root'], // Folder ID at Google Drive
  };
  var formData = new FormData();
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id', {
    method: 'POST',
    headers: new Headers({ 'Authorization': 'Bearer ' + accessToken }),
    body: formData,
  });
  if (!res.ok) {
    reLogin();
    return null;
  }
  return res.json();
};

export const getFile = async (accessToken: string, fileId: string) => {
  const res = await fetch(
    `https://content.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );
  if (!res.ok) {
    reLogin();
    return null;
  }
  return await res.text();
};

export const updateFile = async (
  accessToken: string,
  fileId: string,
  fileContent: string
) => {
  const formData = new FormData();
  var file = new Blob([fileContent], { type: 'text/plain' });
  var metadata = {
    'name': fileName, // Filename at Google Drive
    'title': fileName,
    'mimeType': 'text/plain', // mimeType at Google Drive
  };
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('file', file);

  const res = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=multipart`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    }
  );
  if (!res.ok) {
    reLogin();
    return null;
  }
  return await res.json();
};

export const updateLocalStateFromDrive = (
  access_token: string,
  fileId: string,
  setCurrentChatIndex: Function,
  getCurrentChatIndex: Function,
  setState: Function,
  setCurrentlySaving: Function,
  getHideSideMenu: Function,
  setHideSideMenu: Function,
) => {
  setCurrentlySaving(true);
  getFile(access_token, fileId).then((fileContent) => {
    if (!fileContent) {
      return;
    }
    var state = JSON.parse(fileContent);
    // console.log(state);
    var currentChatIndex = getCurrentChatIndex();
    var hideSideMenu = getHideSideMenu();
    setState(state);
    setCurrentChatIndex(currentChatIndex);
    setHideSideMenu(hideSideMenu);
    setCurrentlySaving(false);
  });
};