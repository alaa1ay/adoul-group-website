/*
 * Simple client-side CMS for Adoul Group website.
 *
 * Data for fabrics and works are stored in the browser's localStorage. This allows
 * adding new items through the admin dashboard without touching the source code.
 *
 * Pages automatically read from localStorage and render cards accordingly. If no
 * data exists, a placeholder message is shown. The request form page populates
 * its fabric dropdown from the stored fabrics.
 */

// Utility functions to get and save JSON arrays in localStorage
function getData(key) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (err) {
    console.warn('Error parsing data for', key, err);
    return [];
  }
}

function saveData(key, arr) {
  localStorage.setItem(key, JSON.stringify(arr));
}

// Load fabrics and render cards on the fabrics page
function loadFabrics() {
  const container = document.getElementById('fabricsContainer');
  if (!container) return;
  const fabrics = getData('fabrics');
  container.innerHTML = '';
  if (fabrics.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'لا يوجد أقمشة مضافة بعد.';
    container.appendChild(p);
    return;
  }
  fabrics.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.name;
    card.appendChild(img);
    const h3 = document.createElement('h3');
    h3.textContent = item.name;
    card.appendChild(h3);
    const pCode = document.createElement('p');
    pCode.innerHTML = '<strong>الكود:</strong> ' + item.code;
    card.appendChild(pCode);
    const pType = document.createElement('p');
    pType.innerHTML = '<strong>النوع:</strong> ' + item.type;
    card.appendChild(pType);
    const pNotes = document.createElement('p');
    pNotes.textContent = item.notes;
    card.appendChild(pNotes);
    container.appendChild(card);
  });
}

// Load works and render cards on the works page
function loadWorks() {
  const container = document.getElementById('worksContainer');
  if (!container) return;
  const works = getData('works');
  container.innerHTML = '';
  if (works.length === 0) {
    const p = document.createElement('p');
    p.textContent = 'لا يوجد أعمال مضافة بعد.';
    container.appendChild(p);
    return;
  }
  works.forEach(item => {
    const card = document.createElement('div');
    card.className = 'card';
    const img = document.createElement('img');
    img.src = item.image;
    img.alt = item.title;
    card.appendChild(img);
    const h3 = document.createElement('h3');
    h3.textContent = item.title;
    card.appendChild(h3);
    const pDesc = document.createElement('p');
    pDesc.textContent = item.description;
    card.appendChild(pDesc);
    container.appendChild(card);
  });
}

// Populate the fabrics select in the request form with available fabrics
function populateFabricOptions() {
  const select = document.getElementById('requestFabric');
  if (!select) return;
  const fabrics = getData('fabrics');
  select.innerHTML = '<option value="">اختر القماش</option>';
  fabrics.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item.name;
    opt.textContent = item.name + (item.code ? ' (' + item.code + ')' : '');
    select.appendChild(opt);
  });
}

// Handle adding a new fabric via the admin dashboard
function handleAddFabric(event) {
  event.preventDefault();
  const name = document.getElementById('fabricName').value.trim();
  const code = document.getElementById('fabricCode').value.trim();
  const type = document.getElementById('fabricType').value;
  const notes = document.getElementById('fabricNotes').value.trim();
  const fileInput = document.getElementById('fabricImage');
  if (!name || !type || fileInput.files.length === 0) {
    alert('يرجى تعبئة جميع الحقول المطلوبة وإرفاق صورة.');
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result;
    const fabrics = getData('fabrics');
    fabrics.push({ id: Date.now(), name, code, type, notes, image: base64 });
    saveData('fabrics', fabrics);
    alert('تم إضافة القماش بنجاح.');
    document.getElementById('fabricForm').reset();
  };
  reader.readAsDataURL(file);
}

// Handle adding a new work via the admin dashboard
function handleAddWork(event) {
  event.preventDefault();
  const title = document.getElementById('workTitle').value.trim();
  const description = document.getElementById('workDescription').value.trim();
  const fileInput = document.getElementById('workImage');
  if (!title || fileInput.files.length === 0) {
    alert('يرجى تعبئة عنوان العمل وإرفاق صورة.');
    return;
  }
  const file = fileInput.files[0];
  const reader = new FileReader();
  reader.onload = function(evt) {
    const base64 = evt.target.result;
    const works = getData('works');
    works.push({ id: Date.now(), title, description, image: base64 });
    saveData('works', works);
    alert('تم إضافة العمل بنجاح.');
    document.getElementById('workForm').reset();
  };
  reader.readAsDataURL(file);
}

// Handle request form submission. For now we simply build a message and display it.
function handleRequestSubmit(event) {
  event.preventDefault();
  const item = document.getElementById('requestItem').value;
  const fabric = document.getElementById('requestFabric').value;
  const dimensions = document.getElementById('requestDimensions').value.trim();
  const city = document.getElementById('requestCity').value.trim();
  const phone = document.getElementById('requestPhone').value.trim();
  if (!item || !fabric || !phone) {
    alert('يرجى تعبئة نوع التفصيل والقماش ورقم الهاتف.');
    return;
  }
  const message = `طلب تفصيل جديد:\n- المطلوب: ${item}\n- القماش: ${fabric}\n- الأبعاد: ${dimensions}\n- المدينة: ${city}\n- الهاتف: ${phone}`;
  alert('تم إرسال طلبك بنجاح!\n\n' + message + '\n\nيرجى التواصل معنا عبر واتساب أو الاتصال لإكمال التفاصيل.');
  document.getElementById('requestForm').reset();
}

// Admin password handling
function setupAdminLogin() {
  const loginSection = document.getElementById('loginSection');
  const adminContent = document.getElementById('adminContent');
  if (!loginSection || !adminContent) return;
  const loginBtn = document.getElementById('loginButton');
  loginBtn.addEventListener('click', function() {
    const passInput = document.getElementById('adminPassword');
    const password = passInput.value;
    if (password === 'adoul123') {
      loginSection.style.display = 'none';
      adminContent.style.display = 'block';
    } else {
      alert('كلمة المرور غير صحيحة.');
    }
  });
}

// Entry point: called on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Load data where necessary
  loadFabrics();
  loadWorks();
  populateFabricOptions();
  // Attach form handlers if forms exist
  const fabricForm = document.getElementById('fabricForm');
  if (fabricForm) {
    fabricForm.addEventListener('submit', handleAddFabric);
  }
  const workForm = document.getElementById('workForm');
  if (workForm) {
    workForm.addEventListener('submit', handleAddWork);
  }
  const requestForm = document.getElementById('requestForm');
  if (requestForm) {
    requestForm.addEventListener('submit', handleRequestSubmit);
  }
  // Setup admin login if present
  setupAdminLogin();
});