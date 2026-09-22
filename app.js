const db = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

let session = null;
let profile = null;
let currentLang = localStorage.getItem('sgc_lang') || 'sw';

const translations = {
  sw: {
    dashboard: 'Dashboard',
    products: 'Bidhaa',
    stock: 'Stock In',
    sales: 'Mauzo / POS',
    customers: 'Wateja',
    payments: 'Malipo',
    expenses: 'Gharama',
    receipts: 'Risiti',
    reports: 'Ripoti',
    settings: 'Mipangilio',

    email: 'Barua pepe',
    password: 'Nenosiri',
    login: 'Ingia',
    logout: 'Toka',
    forgotPassword: 'Umesahau nenosiri?',
    resetPassword: 'Badilisha Nenosiri',
    newPassword: 'Nenosiri Jipya',
    confirmPassword: 'Thibitisha Nenosiri',
    sendResetLink: 'Tuma Link ya Kubadilisha Nenosiri',
    backToLogin: 'Rudi Kwenye Login',
    updatePassword: 'Badilisha Nenosiri',

    name: 'Jina',
    category: 'Kategoria',
    phone: 'Simu',
    address: 'Anwani',
    creditLimit: 'Kikomo cha Deni',
    amount: 'Kiasi',
    notes: 'Maelezo',
    description: 'Maelezo',
    expenseType: 'Aina ya Gharama',
    supplier: 'Msambazaji',
    quantity: 'Idadi',
    buyingPrice: 'Bei ya Kununua',
    sellingPrice: 'Bei ya Kuuza',
    lowStock: 'Kiwango cha Stock Ndogo',
    unit: 'Kipimo',
    save: 'Hifadhi',
    calculate: 'Hesabu',
    generate: 'Tengeneza',
    walkIn: 'Mteja wa kawaida',
    cash: 'Cash',
    mobileMoney: 'Mobile Money',
    bank: 'Benki',
    credit: 'Deni',
    carton: 'Carton',
    crates: 'Crates',
    active: 'Hai',
    yes: 'Ndiyo',
    no: 'Hapana',

    productsCount: 'Bidhaa',
    salesCount: 'Mauzo',
    customersCount: 'Wateja',
    expensesCount: 'Gharama',
    business: 'Biashara',
    system: 'Mfumo',
    user: 'Mtumiaji',
    role: 'Nafasi',

    profitLoss: 'Faida na Hasara',
    totalSales: 'Jumla ya Mauzo',
    cogs: 'Gharama ya Bidhaa Zilizouzwa',
    grossProfit: 'Faida Ghafi',
    netProfit: 'Faida Halisi',
    startDate: 'Tarehe ya Kuanza',
    endDate: 'Tarehe ya Kumaliza',

    noData: 'Hakuna taarifa.',
    ownerOnly: 'Owner pekee ndiye anayeweza kuona ukurasa huu.',
    saleSaved: 'Mauzo yamehifadhiwa.',
    paymentSaved: 'Malipo yamehifadhiwa.',
    passwordUpdated: 'Nenosiri limebadilishwa kikamilifu.',
    resetSent: 'Link ya kubadilisha nenosiri imetumwa kwenye barua pepe yako.',
    passwordsDontMatch: 'Nenosiri hazifanani.',
    passwordTooShort: 'Nenosiri lazima liwe na angalau herufi 6.',
    creditCustomerRequired: 'Mauzo ya deni lazima yawe na mteja.',
    enterEmail: 'Weka barua pepe yako kwanza.',
    resetExpired: 'Link hii ya kubadilisha nenosiri imekwisha muda au si sahihi.',
    loginError: 'Barua pepe au nenosiri si sahihi.',
    error: 'Hitilafu'
  },

  en: {
    dashboard: 'Dashboard',
    products: 'Products',
    stock: 'Stock In',
    sales: 'Sales / POS',
    customers: 'Customers',
    payments: 'Payments',
    expenses: 'Expenses',
    receipts: 'Receipts',
    reports: 'Reports',
    settings: 'Settings',

    email: 'Email',
    password: 'Password',
    login: 'Login',
    logout: 'Logout',
    forgotPassword: 'Forgot Password?',
    resetPassword: 'Reset Password',
    newPassword: 'New Password',
    confirmPassword: 'Confirm Password',
    sendResetLink: 'Send Password Reset Link',
    backToLogin: 'Back to Login',
    updatePassword: 'Update Password',

    name: 'Name',
    category: 'Category',
    phone: 'Phone',
    address: 'Address',
    creditLimit: 'Credit Limit',
    amount: 'Amount',
    notes: 'Notes',
    description: 'Description',
    expenseType: 'Expense Type',
    supplier: 'Supplier',
    quantity: 'Quantity',
    buyingPrice: 'Buying Price',
    sellingPrice: 'Selling Price',
    lowStock: 'Low Stock Level',
    unit: 'Unit',
    save: 'Save',
    calculate: 'Calculate',
    generate: 'Generate',
    walkIn: 'Walk-in Customer',
    cash: 'Cash',
    mobileMoney: 'Mobile Money',
    bank: 'Bank',
    credit: 'Credit',
    carton: 'Carton',
    crates: 'Crates',
    active: 'Active',
    yes: 'Yes',
    no: 'No',

    productsCount: 'Products',
    salesCount: 'Sales',
    customersCount: 'Customers',
    expensesCount: 'Expenses',
    business: 'Business',
    system: 'System',
    user: 'User',
    role: 'Role',

    profitLoss: 'Profit & Loss',
    totalSales: 'Total Sales',
    cogs: 'Cost of Goods Sold',
    grossProfit: 'Gross Profit',
    netProfit: 'Net Profit',
    startDate: 'Start Date',
    endDate: 'End Date',

    noData: 'No information available.',
    ownerOnly: 'Only the owner can access this page.',
    saleSaved: 'Sale saved successfully.',
    paymentSaved: 'Payment saved successfully.',
    passwordUpdated: 'Password updated successfully.',
    resetSent: 'Password reset link has been sent to your email.',
    passwordsDontMatch: 'Passwords do not match.',
    passwordTooShort: 'Password must be at least 6 characters.',
    creditCustomerRequired: 'A credit sale must have a customer.',
    enterEmail: 'Please enter your email first.',
    resetExpired: 'This password reset link has expired or is invalid.',
    loginError: 'Invalid email or password.',
    error: 'Error'
  }
};

function t(key) {
  return translations[currentLang][key] || key;
}

function money(value) {
  return 'TSh ' + Number(value || 0).toLocaleString('en-TZ', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function translateError(error) {
  if (!error) return '';

  const message = String(error.message || error);

  if (
    message.toLowerCase().includes('invalid login credentials')
  ) {
    return t('loginError');
  }

  if (
    message.toLowerCase().includes('password should be at least')
  ) {
    return t('passwordTooShort');
  }

  return message;
}

function isResetMode() {
  return window.location.hash.includes('reset-password');
}

async function init() {
  if (isResetMode()) {
    showResetPassword();
    return;
  }

  const { data } = await db.auth.getSession();

  session = data.session;

  if (session) {
    await boot();
  } else {
    loginView();
  }

  db.auth.onAuthStateChange(async (event, newSession) => {
    session = newSession;

    if (event === 'PASSWORD_RECOVERY') {
      showResetPassword();
      return;
    }

    if (session) {
      await boot();
    } else {
      loginView();
    }
  });
}

function loginView() {
  login.classList.remove('hidden');
  app.classList.add('hidden');

  login.innerHTML = `
    <div class="card login">
      <h1>SGC SOFT DRINKS</h1>
      <p>MANAGEMENT</p>

      <form id="loginForm">
        <input
          id="email"
          type="email"
          placeholder="${t('email')}"
          required
        >

        <input
          id="password"
          type="password"
          placeholder="${t('password')}"
          required
        >

        <button type="submit">
          ${t('login')}
        </button>
      </form>

      <button
        id="forgotBtn"
        type="button"
        class="outline"
        style="margin-top:10px;width:100%;"
      >
        ${t('forgotPassword')}
      </button>

      <div id="loginMsg"></div>
    </div>
  `;

  document.getElementById('loginForm').onsubmit = async e => {
    e.preventDefault();

    const emailValue = document.getElementById('email').value.trim();
    const passwordValue = document.getElementById('password').value;

    const msg = document.getElementById('loginMsg');
    msg.textContent = '';

    const { error } = await db.auth.signInWithPassword({
      email: emailValue,
      password: passwordValue
    });

    if (error) {
      msg.textContent = translateError(error);
    }
  };

  document.getElementById('forgotBtn').onclick = showForgotPassword;
}

function showForgotPassword() {
  login.classList.remove('hidden');
  app.classList.add('hidden');

  login.innerHTML = `
    <div class="card login">
      <h1>SGC SOFT DRINKS</h1>
      <p>${t('resetPassword')}</p>

      <form id="forgotForm">
        <input
          id="forgotEmail"
          type="email"
          placeholder="${t('email')}"
          required
        >

        <button type="submit">
          ${t('sendResetLink')}
        </button>
      </form>

      <button
        id="backLogin"
        type="button"
        class="outline"
        style="margin-top:10px;width:100%;"
      >
        ${t('backToLogin')}
      </button>

      <div id="forgotMsg"></div>
    </div>
  `;

  document.getElementById('forgotForm').onsubmit = async e => {
    e.preventDefault();

    const emailValue =
      document.getElementById('forgotEmail').value.trim();

    const msg = document.getElementById('forgotMsg');
    msg.textContent = '';

    if (!emailValue) {
      msg.textContent = t('enterEmail');
      return;
    }

    /*
      IMPORTANT:
      We use a HASH route instead of /reset-password.
      This prevents Netlify from returning a 404.
    */
    const redirectTo =
      `${window.location.origin}/#reset-password`;

    const { error } = await db.auth.resetPasswordForEmail(
      emailValue,
      {
        redirectTo
      }
    );

    if (error) {
      msg.textContent = translateError(error);
    } else {
      msg.textContent = t('resetSent');
    }
  };

  document.getElementById('backLogin').onclick = loginView;
}

function showResetPassword() {
  login.classList.remove('hidden');
  app.classList.add('hidden');

  login.innerHTML = `
    <div class="card login">
      <h1>SGC SOFT DRINKS</h1>
      <p>${t('resetPassword')}</p>

      <form id="resetForm">
        <input
          id="newPassword"
          type="password"
          placeholder="${t('newPassword')}"
          minlength="6"
          required
        >

        <input
          id="confirmPassword"
          type="password"
          placeholder="${t('confirmPassword')}"
          minlength="6"
          required
        >

        <button type="submit">
          ${t('updatePassword')}
        </button>
      </form>

      <button
        id="resetBackLogin"
        type="button"
        class="outline"
        style="margin-top:10px;width:100%;"
      >
        ${t('backToLogin')}
      </button>

      <div id="resetMsg"></div>
    </div>
  `;

  document.getElementById('resetForm').onsubmit = async e => {
    e.preventDefault();

    const newPassword =
      document.getElementById('newPassword').value;

    const confirmPassword =
      document.getElementById('confirmPassword').value;

    const msg = document.getElementById('resetMsg');
    msg.textContent = '';

    if (newPassword.length < 6) {
      msg.textContent = t('passwordTooShort');
      return;
    }

    if (newPassword !== confirmPassword) {
      msg.textContent = t('passwordsDontMatch');
      return;
    }

    const { error } = await db.auth.updateUser({
      password: newPassword
    });

    if (error) {
      msg.textContent = translateError(error);
      return;
    }

    msg.textContent = t('passwordUpdated');

    setTimeout(async () => {
      window.location.hash = '';
      await db.auth.signOut();
      loginView();
    }, 1500);
  };

  document.getElementById('resetBackLogin').onclick = () => {
    window.location.hash = '';
    loginView();
  };
}

async function boot() {
  const { data, error } = await db
    .from('profiles')
    .select('id,full_name,role,language,active')
    .eq('id', session.user.id)
    .single();

  if (error || !data?.active) {
    await db.auth.signOut();
    return;
  }

  profile = data;

  if (!localStorage.getItem('sgc_lang')) {
    currentLang = data.language || 'sw';
  }

  login.classList.add('hidden');
  app.classList.remove('hidden');

  renderNav();
  show('dashboard');
}

logout.onclick = () => db.auth.signOut();

lang.onclick = () => {
  currentLang = currentLang === 'sw' ? 'en' : 'sw';

  localStorage.setItem('sgc_lang', currentLang);

  renderNav();
  show('dashboard');
};

function renderNav() {
  user.textContent =
    `${profile.full_name} • ${profile.role}`;

  document.querySelector('header .outline').textContent =
    currentLang === 'sw' ? 'EN' : 'SW';

  const pages = [
    'dashboard',
    'products',
    'stock',
    'sales',
    'customers',
    'payments',
    'expenses',
    'receipts'
  ];

  if (profile.role === 'owner') {
    pages.push('reports');
  }

  pages.push('settings');

  nav.innerHTML = pages.map(page =>
    `<button onclick="show('${page}')">${t(page)}</button>`
  ).join('');

  logout.textContent = t('logout');
}

function show(page) {
  title.textContent = t(page);

  const pages = {
    dashboard,
    products,
    stock,
    sales,
    customers,
    payments,
    expenses,
    receipts,
    reports,
    settings
  };

  if (pages[page]) {
    pages[page]();
  }
}

async function dashboard() {
  content.innerHTML = `
    <div class="page">

      <div class="cards">

        <div class="stat">
          ${t('productsCount')}
          <b id="a">...</b>
        </div>

        <div class="stat">
          ${t('salesCount')}
          <b id="b">...</b>
        </div>

        <div class="stat">
          ${t('customersCount')}
          <b id="c">...</b>
        </div>

        <div class="stat">
          ${t('expensesCount')}
          <b id="d">...</b>
        </div>

      </div>

      <div class="panel">
        <h2>SGC SOFT DRINKS</h2>
        <p>SGC SOFT DRINKS MANAGEMENT</p>
      </div>

    </div>
  `;

  const [
    productsResult,
    salesResult,
    customersResult,
    expensesResult
  ] = await Promise.all([
    db.rpc('get_products_for_sales'),
    db.from('sales').select('id', { count: 'exact', head: true }),
    db.from('customers').select('id', { count: 'exact', head: true }),
    db.from('expenses').select('id', { count: 'exact', head: true })
  ]);

  document.getElementById('a').textContent =
    productsResult.data?.length || 0;

  document.getElementById('b').textContent =
    salesResult.count || 0;

  document.getElementById('c').textContent =
    customersResult.count || 0;

  document.getElementById('d').textContent =
    expensesResult.count || 0;
}

function table(rows, columns) {
  if (!rows?.length) {
    return `<p>${t('noData')}</p>`;
  }

  return `
    <div class="table">
      <table>
        <thead>
          <tr>
            ${columns.map(x =>
              `<th>${esc(x)}</th>`
            ).join('')}
          </tr>
        </thead>

        <tbody>
          ${rows.map(row =>
            '<tr>' +
            columns.map(column =>
              `<td>${esc(row[column])}</td>`
            ).join('') +
            '</tr>'
          ).join('')}
        </tbody>
      </table>
    </div>
  `;
}

async function products() {
  let html = `
    <div class="page">
      <div class="panel">
        <h2>${t('products')}</h2>
  `;

  if (profile.role === 'owner') {
    html += `
      <form id="pf">

        <div class="grid">

          <input
            id="pn"
            placeholder="${t('name')}"
            required
          >

          <input
            id="pc"
            placeholder="${t('category')}"
          >

          <select id="pu">
            <option value="Carton">${t('carton')}</option>
            <option value="Crates">${t('crates')}</option>
          </select>

          <input
            id="pb"
            type="number"
            min="0"
            step=".01"
            placeholder="${t('buyingPrice')}"
            required
          >

          <input
            id="ps"
            type="number"
            min="0"
            step=".01"
            placeholder="${t('sellingPrice')}"
            required
          >

          <input
            id="pl"
            type="number"
            min="0"
            step=".01"
            placeholder="${t('lowStock')}"
            value="0"
          >

        </div>

        <div class="actions">
          <button>${t('save')}</button>
        </div>

      </form>
    `;
  }

  html += `
        <div id="plst"></div>
      </div>
    </div>
  `;

  content.innerHTML = html;

  if (profile.role === 'owner') {
    pf.onsubmit = async e => {
      e.preventDefault();

      const { error } = await db
        .from('products')
        .insert({
          name: pn.value,
          category: pc.value || null,
          unit: pu.value,
          buying_price: +pb.value,
          selling_price: +ps.value,
          low_stock_level: +pl.value
        });

      if (error) {
        alert(translateError(error));
      } else {
        e.target.reset();
        loadProducts();
      }
    };
  }

  loadProducts();
}

async function loadProducts() {
  const { data, error } = await db.rpc(
    profile.role === 'owner'
      ? 'get_products_for_owner'
      : 'get_products_for_sales'
  );

  document.getElementById('plst').innerHTML =
    error
      ? esc(translateError(error))
      : table(
          data,
          profile.role === 'owner'
            ? ['name', 'category', 'unit', 'buying_price', 'selling_price', 'active']
            : ['name', 'category', 'unit', 'selling_price', 'active']
        );
}

async function stock() {
  const { data: productsData } =
    await db.rpc('get_products_for_sales');

  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('stock')}</h2>

        <form id="sf">

          <div class="grid">

            <select id="sp">
              ${(productsData || []).map(x => `
                <option value="${x.id}">
                  ${esc(x.name)} — ${money(x.selling_price)}
                </option>
              `).join('')}
            </select>

            <input
              id="sq"
              type="number"
              min=".01"
              step=".01"
              placeholder="${t('quantity')}"
              required
            >

            <select id="su">
              <option value="Carton">${t('carton')}</option>
              <option value="Crates">${t('crates')}</option>
            </select>

            <input
              id="ss"
              placeholder="${t('supplier')}"
            >

          </div>

          <div class="actions">
            <button>${t('save')}</button>
          </div>

        </form>

        <div id="slst"></div>

      </div>
    </div>
  `;

  sf.onsubmit = async e => {
    e.preventDefault();

    const { error } = await db
      .from('stock_in')
      .insert({
        product_id: sp.value,
        quantity: +sq.value,
        unit: su.value,
        supplier_name: ss.value || null,
        recorded_by: session.user.id,
        buying_price: null
      });

    if (error) {
      alert(translateError(error));
    } else {
      e.target.reset();
      loadStock();
    }
  };

  loadStock();
}

async function loadStock() {
  const { data, error } = await db.rpc(
    profile.role === 'owner'
      ? 'get_product_stock_for_owner'
      : 'get_product_stock_for_sales'
  );

  slst.innerHTML =
    error
      ? esc(translateError(error))
      : table(
          data,
          profile.role === 'owner'
            ? ['product_id', 'unit', 'quantity', 'buying_price', 'selling_price']
            : ['product_id', 'unit', 'quantity', 'selling_price']
        );
}

async function sales() {
  const { data: productsData } =
    await db.rpc('get_products_for_sales');

  const { data: customersData } =
    await db
      .from('customers')
      .select('id,name,current_balance')
      .eq('active', true);

  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('sales')}</h2>

        <form id="saleForm">

          <div class="grid">

            <select id="sc">
              <option value="">
                ${t('walkIn')}
              </option>

              ${(customersData || []).map(x => `
                <option value="${x.id}">
                  ${esc(x.name)}
                </option>
              `).join('')}
            </select>

            <select id="sm">
              <option value="Cash">${t('cash')}</option>
              <option value="Mobile Money">${t('mobileMoney')}</option>
              <option value="Bank">${t('bank')}</option>
              <option value="Credit">${t('credit')}</option>
            </select>

            <select id="spi">
              ${(productsData || []).map(x => `
                <option
                  value="${x.id}"
                  data-price="${x.selling_price}"
                >
                  ${esc(x.name)} — ${money(x.selling_price)}
                </option>
              `).join('')}
            </select>

            <input
              id="sqi"
              type="number"
              min=".01"
              step=".01"
              value="1"
            >

            <select id="sui">
              <option value="Carton">${t('carton')}</option>
              <option value="Crates">${t('crates')}</option>
            </select>

            <input
              id="sprice"
              readonly
              placeholder="${t('sellingPrice')}"
            >

          </div>

          <div class="actions">
            <button type="button" id="calc">
              ${t('calculate')}
            </button>

            <button>
              ${t('save')}
            </button>
          </div>

          <p id="st"></p>

        </form>

      </div>
    </div>
  `;

  function price() {
    sprice.value =
      spi.options[spi.selectedIndex]?.dataset.price || 0;

    st.textContent =
      money(+sqi.value * +sprice.value);
  }

  spi.onchange = price;
  sqi.oninput = price;
  calc.onclick = price;

  price();

  saleForm.onsubmit = async e => {
    e.preventDefault();

    const total =
      +sqi.value * +sprice.value;

    if (sm.value === 'Credit' && !sc.value) {
      alert(t('creditCustomerRequired'));
      return;
    }

    const { data: sale, error } =
      await db
        .from('sales')
        .insert({
          customer_id: sc.value || null,
          payment_method: sm.value,
          total_amount: total,
          amount_paid:
            sm.value === 'Credit' ? 0 : total,
          sold_by: session.user.id
        })
        .select('id')
        .single();

    if (error) {
      alert(translateError(error));
      return;
    }

    const { error: itemError } =
      await db
        .from('sale_items')
        .insert({
          sale_id: sale.id,
          product_id: spi.value,
          quantity: +sqi.value,
          unit: sui.value,
          selling_price: +sprice.value
        });

    if (itemError) {
      alert(translateError(itemError));
    } else {
      alert(t('saleSaved'));
    }
  };
}

async function customers() {
  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('customers')}</h2>

        <form id="cf">

          <div class="grid">

            <input
              id="cn"
              placeholder="${t('name')}"
              required
            >

            <input
              id="cp"
              placeholder="${t('phone')}"
            >

            <input
              id="ca"
              placeholder="${t('address')}"
            >

            <input
              id="cl"
              type="number"
              min="0"
              step=".01"
              placeholder="${t('creditLimit')}"
              value="0"
            >

          </div>

          <div class="actions">
            <button>${t('save')}</button>
          </div>

        </form>

        <div id="clst"></div>

      </div>
    </div>
  `;

  cf.onsubmit = async e => {
    e.preventDefault();

    const { error } =
      await db
        .from('customers')
        .insert({
          name: cn.value,
          phone: cp.value || null,
          address: ca.value || null,
          credit_limit: +cl.value
        });

    if (error) {
      alert(translateError(error));
    } else {
      e.target.reset();
      loadCustomers();
    }
  };

  loadCustomers();
}

async function loadCustomers() {
  const { data, error } =
    await db
      .from('customers')
      .select(
        'name,phone,address,credit_limit,current_balance,active'
      )
      .order('name');

  clst.innerHTML =
    error
      ? esc(translateError(error))
      : table(
          data,
          [
            'name',
            'phone',
            'address',
            'credit_limit',
            'current_balance'
          ]
        );
}

async function payments() {
  const { data: customersData } =
    await db
      .from('customers')
      .select('id,name,current_balance')
      .gt('current_balance', 0);

  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('payments')}</h2>

        <form id="payf">

          <div class="grid">

            <select id="pcu">
              ${(customersData || []).map(x => `
                <option value="${x.id}">
                  ${esc(x.name)} — ${money(x.current_balance)}
                </option>
              `).join('')}
            </select>

            <input
              id="pa"
              type="number"
              min=".01"
              step=".01"
              placeholder="${t('amount')}"
              required
            >

            <select id="pm">
              <option value="Cash">${t('cash')}</option>
              <option value="Mobile Money">${t('mobileMoney')}</option>
              <option value="Bank">${t('bank')}</option>
            </select>

            <input
              id="pnote"
              placeholder="${t('notes')}"
            >

          </div>

          <div class="actions">
            <button>${t('save')}</button>
          </div>

        </form>

      </div>
    </div>
  `;

  payf.onsubmit = async e => {
    e.preventDefault();

    const { error } =
      await db
        .from('customer_payments')
        .insert({
          customer_id: pcu.value,
          amount: +pa.value,
          payment_method: pm.value,
          recorded_by: session.user.id,
          notes: pnote.value || null
        });

    if (error) {
      alert(translateError(error));
    } else {
      alert(t('paymentSaved'));
      e.target.reset();
    }
  };
}

async function expenses() {
  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('expenses')}</h2>

        <form id="ef">

          <div class="grid">

            <input
              id="et"
              placeholder="${t('expenseType')}"
              required
            >

            <input
              id="ed"
              placeholder="${t('description')}"
            >

            <input
              id="ea"
              type="number"
              min=".01"
              step=".01"
              placeholder="${t('amount')}"
              required
            >

            <select id="em">
              <option value="Cash">${t('cash')}</option>
              <option value="Mobile Money">${t('mobileMoney')}</option>
              <option value="Bank">${t('bank')}</option>
            </select>

          </div>

          <div class="actions">
            <button>${t('save')}</button>
          </div>

        </form>

        <div id="elst"></div>

      </div>
    </div>
  `;

  ef.onsubmit = async e => {
    e.preventDefault();

    const { error } =
      await db
        .from('expenses')
        .insert({
          expense_type: et.value,
          description: ed.value || null,
          amount: +ea.value,
          payment_method: em.value,
          recorded_by: session.user.id
        });

    if (error) {
      alert(translateError(error));
    } else {
      e.target.reset();
      loadExpenses();
    }
  };

  loadExpenses();
}

async function loadExpenses() {
  const { data, error } =
    await db
      .from('expenses')
      .select(
        'expense_type,description,amount,payment_method,created_at'
      )
      .order('created_at', {
        ascending: false
      })
      .limit(50);

  elst.innerHTML =
    error
      ? esc(translateError(error))
      : table(
          data,
          [
            'expense_type',
            'description',
            'amount',
            'payment_method',
            'created_at'
          ]
        );
}

async function receipts() {
  const { data, error } =
    await db
      .from('receipts')
      .select(
        'receipt_number,sale_id,created_at'
      )
      .order('created_at', {
        ascending: false
      })
      .limit(50);

  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('receipts')}</h2>

        ${
          error
            ? esc(translateError(error))
            : table(
                data,
                [
                  'receipt_number',
                  'sale_id',
                  'created_at'
                ]
              )
        }

      </div>
    </div>
  `;
}

async function reports() {
  if (profile.role !== 'owner') {
    content.innerHTML = `
      <div class="page">
        <div class="panel">
          ${t('ownerOnly')}
        </div>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('profitLoss')}</h2>

        <div class="grid">

          <input
            id="rs"
            type="date"
          >

          <input
            id="re"
            type="date"
          >

        </div>

        <div class="actions">
          <button id="run">
            ${t('generate')}
          </button>
        </div>

        <div id="rr"></div>

      </div>
    </div>
  `;

  const today =
    new Date().toISOString().slice(0, 10);

  rs.value = today;
  re.value = today;

  run.onclick = async () => {
    const { data, error } =
      await db.rpc(
        'get_profit_loss_by_date',
        {
          start_date: rs.value,
          end_date: re.value
        }
      );

    if (error) {
      rr.textContent = translateError(error);
      return;
    }

    const result = data?.[0];

    rr.innerHTML = result
      ? `
        <div class="cards">

          <div class="stat">
            ${t('totalSales')}
            <b>${money(result.total_sales)}</b>
          </div>

          <div class="stat">
            ${t('cogs')}
            <b>${money(result.cost_of_goods_sold)}</b>
          </div>

          <div class="stat">
            ${t('grossProfit')}
            <b>${money(result.gross_profit)}</b>
          </div>

          <div class="stat">
            ${t('netProfit')}
            <b>${money(result.net_profit)}</b>
          </div>

        </div>
      `
      : `<p>${t('noData')}</p>`;
  };
}

function settings() {
  content.innerHTML = `
    <div class="page">
      <div class="panel">

        <h2>${t('settings')}</h2>

        <p>
          <b>${t('business')}:</b>
          SGC SOFT DRINKS
        </p>

        <p>
          <b>${t('system')}:</b>
          SGC SOFT DRINKS MANAGEMENT
        </p>

        <p>
          <b>${t('user')}:</b>
          ${esc(profile.full_name)}
        </p>

        <p>
          <b>${t('role')}:</b>
          ${esc(profile.role)}
        </p>

      </div>
    </div>
  `;
}

init();
