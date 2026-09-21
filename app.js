/* =========================================================
   SGC SOFT DRINKS MANAGEMENT
   Main Application JavaScript
   ========================================================= */

"use strict";

/* =========================================================
   1. SUPABASE CONFIGURATION
   ========================================================= */

const SUPABASE_URL =
    "https://tnisfcwaogixrfplmnso.supabase.co";

const SUPABASE_ANON_KEY =
    "sb_publishable_9sOjYHijGGRoZ9QjXwJfxw_LXlfP-JZ";

const { createClient } = window.supabase;

const supabaseClient = createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);


/* =========================================================
   2. APPLICATION STATE
   ========================================================= */

const state = {
    user: null,
    profile: null,
    role: null,
    language: "sw",

    products: [],
    stock: [],
    customers: [],
    sales: [],
    payments: [],
    expenses: [],

    currentSaleItems: [],

    cropper: null,
    croppedAvatarData: null,

    currentPage: "dashboard"
};


/* =========================================================
   3. CONSTANTS
   ========================================================= */

const LOGO_URL =
    "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgRsGllLOBF63Unp0kzICif6C1tapkNBLRntsN7FJJPLlytEa9m1uBi_CdMVtnA7HmE1niKAeRc7FaKka9HamTfaSy4Mp5V8jnfl0DJt12zb4S4WhtI3PSJH9mHkxhu65YXSVA7sD5b8sOfw8jakPYp3H8Um8qvyjlDzxWgNcdsH2qVTmnMbjsZF4TN/s1280/244759.png";

const PROFILE_AVATAR_FIELD = "avatar_url";

const TIMEZONE = "Africa/Dar_es_Salaam";


/* =========================================================
   4. TRANSLATIONS
   ========================================================= */

const translations = {
    sw: {
        dashboard: "Dashboard",
        products: "Bidhaa",
        stock: "Stock In",
        sales: "Mauzo",
        customers: "Wateja",
        payments: "Malipo",
        expenses: "Expenses",
        reports: "Reports",
        owner: "Owner",
        salesman: "Salesman",
        logout: "Logout",
        save: "Hifadhi",
        cancel: "Cancel",
        loading: "Inapakia...",
        noData: "Hakuna taarifa.",
        success: "Imefanikiwa.",
        error: "Kuna tatizo.",
        walkIn: "Mteja wa kawaida",
        cash: "Cash",
        mobileMoney: "Mobile Money",
        bank: "Bank",
        credit: "Credit"
    },

    en: {
        dashboard: "Dashboard",
        products: "Products",
        stock: "Stock In",
        sales: "Sales",
        customers: "Customers",
        payments: "Payments",
        expenses: "Expenses",
        reports: "Reports",
        owner: "Owner",
        salesman: "Salesman",
        logout: "Logout",
        save: "Save",
        cancel: "Cancel",
        loading: "Loading...",
        noData: "No records found.",
        success: "Successful.",
        error: "Something went wrong.",
        walkIn: "Walk-in Customer",
        cash: "Cash",
        mobileMoney: "Mobile Money",
        bank: "Bank",
        credit: "Credit"
    }
};


/* =========================================================
   5. DOM HELPERS
   ========================================================= */

function $(id) {
    return document.getElementById(id);
}

function qs(selector, parent = document) {
    return parent.querySelector(selector);
}

function qsa(selector, parent = document) {
    return [...parent.querySelectorAll(selector)];
}


/* =========================================================
   6. BASIC HELPERS
   ========================================================= */

function escapeHTML(value) {
    if (value === null || value === undefined) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function formatCurrency(value) {
    const amount = Number(value || 0);

    return new Intl.NumberFormat("en-TZ", {
        maximumFractionDigits: 2
    }).format(amount) + " TSh";
}


function formatNumber(value) {
    return new Intl.NumberFormat("en-TZ", {
        maximumFractionDigits: 2
    }).format(Number(value || 0));
}


function formatDate(dateValue) {
    if (!dateValue) {
        return "—";
    }

    try {
        return new Intl.DateTimeFormat(
            "en-GB",
            {
                timeZone: TIMEZONE,
                dateStyle: "medium",
                timeStyle: "short"
            }
        ).format(new Date(dateValue));
    } catch (error) {
        return new Date(dateValue).toLocaleString();
    }
}


function todayISO() {
    const date = new Date();

    const formatter = new Intl.DateTimeFormat(
        "en-CA",
        {
            timeZone: TIMEZONE,
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }
    );

    return formatter.format(date);
}


function getInitials(name) {
    if (!name) {
        return "U";
    }

    const parts = String(name)
        .trim()
        .split(/\s+/)
        .filter(Boolean);

    if (parts.length === 1) {
        return parts[0].substring(0, 2).toUpperCase();
    }

    return (
        parts[0].charAt(0) +
        parts[parts.length - 1].charAt(0)
    ).toUpperCase();
}


function roleLabel(role) {
    if (role === "owner") {
        return "Owner";
    }

    if (role === "salesman") {
        return "Salesman";
    }

    return role || "";
}


function isOwner() {
    return state.role === "owner";
}


function isSalesman() {
    return state.role === "salesman";
}


function showElement(element) {
    if (element) {
        element.classList.remove("hidden");
    }
}


function hideElement(element) {
    if (element) {
        element.classList.add("hidden");
    }
}


function setButtonLoading(button, loading, loadingText = "Inapakia...") {
    if (!button) {
        return;
    }

    if (loading) {
        button.dataset.originalText = button.innerHTML;
        button.disabled = true;
        button.innerHTML = loadingText;
    } else {
        button.disabled = false;

        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
    }
}


function setMessage(element, message, type = "error") {
    if (!element) {
        return;
    }

    element.textContent = message || "";
    element.className = "form-message";

    if (message) {
        element.classList.add(type);
    }
}


function notify(message, type = "success") {
    /*
     * Uses a simple temporary notification.
     * No external toast library is required.
     */

    let toast = $("appToast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "appToast";

        Object.assign(toast.style, {
            position: "fixed",
            right: "20px",
            bottom: "20px",
            zIndex: "99999",
            padding: "14px 18px",
            borderRadius: "10px",
            color: "#fff",
            fontWeight: "600",
            maxWidth: "360px",
            boxShadow: "0 10px 30px rgba(0,0,0,.2)"
        });

        document.body.appendChild(toast);
    }

    toast.style.background =
        type === "error"
            ? "#dc2626"
            : type === "warning"
                ? "#d97706"
                : "#059669";

    toast.textContent = message;

    clearTimeout(window.__sgcToastTimer);

    window.__sgcToastTimer = setTimeout(() => {
        toast.remove();
    }, 3500);
}


/* =========================================================
   7. MODAL FUNCTIONS
   ========================================================= */

function openModal(id) {
    const modal = $(id);

    if (!modal) {
        return;
    }

    modal.classList.remove("hidden");
    document.body.classList.add("modal-open");
}


function closeModal(id) {
    const modal = $(id);

    if (!modal) {
        return;
    }

    modal.classList.add("hidden");

    if (qsa(".modal:not(.hidden)").length === 0) {
        document.body.classList.remove("modal-open");
    }
}


function closeAllModals() {
    qsa(".modal").forEach(modal => {
        modal.classList.add("hidden");
    });

    document.body.classList.remove("modal-open");
}


/* =========================================================
   8. AUTH PAGE CONTROL
   ========================================================= */

function showLoginPage() {
    showElement($("loginPage"));
    hideElement($("forgotPasswordPage"));
    hideElement($("appPage"));
}


function showForgotPasswordPage() {
    hideElement($("loginPage"));
    showElement($("forgotPasswordPage"));
    hideElement($("appPage"));
}


function showAppPage() {
    hideElement($("loginPage"));
    hideElement($("forgotPasswordPage"));
    showElement($("appPage"));
}


/* =========================================================
   9. LOGIN
   ========================================================= */

async function handleLogin(event) {
    event.preventDefault();

    const email = $("loginEmail")?.value.trim();
    const password = $("loginPassword")?.value;

    const button = $("loginButton");
    const message = $("loginMessage");

    if (!email || !password) {
        setMessage(
            message,
            "Tafadhali jaza email na password.",
            "error"
        );

        return;
    }

    setButtonLoading(button, true, "Inaingia...");

    setMessage(message, "");

    try {
        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email,
                password
            });

        if (error) {
            throw error;
        }

        state.user = data.user;

        await loadUserProfile();

        showAppPage();

        await initializeApplication();

    } catch (error) {
        console.error("Login error:", error);

        setMessage(
            message,
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(button, false);
    }
}


/* =========================================================
   10. LOGOUT
   ========================================================= */

async function handleLogout() {
    try {
        await supabaseClient.auth.signOut();
    } catch (error) {
        console.error("Logout error:", error);
    }

    state.user = null;
    state.profile = null;
    state.role = null;

    showLoginPage();

    if ($("loginPassword")) {
        $("loginPassword").value = "";
    }
}


/* =========================================================
   11. FORGOT PASSWORD
   ========================================================= */

async function handleForgotPassword(event) {
    event.preventDefault();

    const email = $("forgotEmail")?.value.trim();
    const button = $("sendResetButton");
    const message = $("forgotMessage");

    if (!email) {
        setMessage(
            message,
            "Ingiza email yako.",
            "error"
        );

        return;
    }

    setButtonLoading(button, true, "Inatuma...");

    setMessage(message, "");

    try {
        const redirectUrl =
            window.location.origin +
            window.location.pathname;

        const { error } =
            await supabaseClient.auth.resetPasswordForEmail(
                email,
                {
                    redirectTo: redirectUrl
                }
            );

        if (error) {
            throw error;
        }

        setMessage(
            message,
            "Reset link imetumwa kwenye email yako.",
            "success"
        );

    } catch (error) {
        console.error("Password reset error:", error);

        setMessage(
            message,
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(button, false);
    }
}


/* =========================================================
   12. LOAD USER PROFILE
   ========================================================= */

async function loadUserProfile() {
    if (!state.user) {
        return;
    }

    const { data, error } =
        await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", state.user.id)
            .single();

    if (error) {
        console.error("Profile error:", error);

        /*
         * Fallback if profile doesn't exist.
         * Normally the database trigger should create it.
         */
        state.profile = {
            id: state.user.id,
            full_name:
                state.user.user_metadata?.full_name ||
                state.user.email?.split("@")[0] ||
                "User",
            phone: "",
            role: "salesman",
            language: "sw",
            active: true
        };

        state.role = state.profile.role;

        return;
    }

    state.profile = data;
    state.role = data.role;

    state.language =
        data.language === "en"
            ? "en"
            : "sw";
}


/* =========================================================
   13. UPDATE USER DISPLAY
   ========================================================= */

function updateUserInterface() {
    const profile = state.profile;

    if (!profile) {
        return;
    }

    const name =
        profile.full_name ||
        state.user?.email ||
        "User";

    const role = roleLabel(profile.role);

    /* Sidebar */
    if ($("sidebarUserName")) {
        $("sidebarUserName").textContent = name;
    }

    if ($("sidebarUserRole")) {
        $("sidebarUserRole").textContent = role;
    }

    /* Topbar */
    if ($("topbarUserName")) {
        $("topbarUserName").textContent = name;
    }

    if ($("topbarUserRole")) {
        $("topbarUserRole").textContent = role;
    }

    /* Dashboard */
    if ($("dashboardUserName")) {
        $("dashboardUserName").textContent = name;
    }

    if ($("dashboardUserRole")) {
        $("dashboardUserRole").textContent = role;
    }

    if ($("dashboardInfoUserName")) {
        $("dashboardInfoUserName").textContent = name;
    }

    if ($("dashboardInfoUserRole")) {
        $("dashboardInfoUserRole").textContent = role;
    }

    /* Profile */
    if ($("profileDisplayName")) {
        $("profileDisplayName").value =
            profile.full_name || "";
    }

    if ($("profilePhone")) {
        $("profilePhone").value =
            profile.phone || "";
    }

    if ($("profileEmail")) {
        $("profileEmail").value =
            state.user?.email || "";
    }

    updateAvatarUI();
}


/* =========================================================
   14. PROFILE AVATAR
   ========================================================= */

function updateAvatarUI() {
    const profile = state.profile;

    if (!profile) {
        return;
    }

    const name =
        profile.full_name ||
        state.user?.email ||
        "User";

    const initials = getInitials(name);

    const avatarUrl =
        profile[PROFILE_AVATAR_FIELD] || "";

    const avatarElements = [
        {
            container: $("sidebarProfileAvatar"),
            initials: $("sidebarProfileInitials"),
            className: "sidebar-user-avatar"
        },
        {
            container: $("topbarProfileAvatar"),
            initials: $("topbarProfileInitials"),
            className: "current-user-avatar"
        },
        {
            container: $("profileAvatar"),
            initials: $("profileInitials"),
            className: "large-profile-avatar"
        }
    ];

    avatarElements.forEach(item => {
        if (!item.container) {
            return;
        }

        if (avatarUrl) {
            item.container.style.backgroundImage =
                `url("${avatarUrl}")`;

            item.container.style.backgroundSize = "cover";
            item.container.style.backgroundPosition = "center";

            if (item.initials) {
                item.initials.style.display = "none";
            }

        } else {
            item.container.style.backgroundImage = "";

            if (item.initials) {
                item.initials.textContent = initials;
                item.initials.style.display = "";
            }
        }
    });
}


/* =========================================================
   15. PROFILE MODAL
   ========================================================= */

function openProfileModal() {
    updateUserInterface();
    openModal("profileModal");
}


async function handleProfileSave(event) {
    event.preventDefault();

    if (!state.user) {
        return;
    }

    const displayName =
        $("profileDisplayName")?.value.trim();

    const phone =
        $("profilePhone")?.value.trim();

    const button = $("saveProfileBtn");
    const message = $("profileMessage");

    if (!displayName) {
        setMessage(
            message,
            "Display name inahitajika.",
            "error"
        );

        return;
    }

    setButtonLoading(button, true, "Inahifadhi...");

    setMessage(message, "");

    try {
        const updateData = {
            full_name: displayName,
            phone: phone || null,
            updated_at: new Date().toISOString()
        };

        if (state.croppedAvatarData !== null) {
            updateData[PROFILE_AVATAR_FIELD] =
                state.croppedAvatarData || null;
        }

        const { data, error } =
            await supabaseClient
                .from("profiles")
                .update(updateData)
                .eq("id", state.user.id)
                .select()
                .single();

        if (error) {
            throw error;
        }

        state.profile = data;
        state.role = data.role;

        state.croppedAvatarData = null;

        updateUserInterface();

        setMessage(
            message,
            "Profile imehifadhiwa.",
            "success"
        );

        notify("Profile imehifadhiwa.");

    } catch (error) {
        console.error("Profile update error:", error);

        setMessage(
            message,
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(button, false);
    }
}


/* =========================================================
   16. REMOVE PROFILE PICTURE
   ========================================================= */

async function removeProfilePicture() {
    if (!state.user) {
        return;
    }

    const confirmed =
        window.confirm(
            "Una uhakika unataka kuondoa profile picture?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("profiles")
                .update({
                    [PROFILE_AVATAR_FIELD]: null,
                    updated_at: new Date().toISOString()
                })
                .eq("id", state.user.id)
                .select()
                .single();

        if (error) {
            throw error;
        }

        state.profile = data;
        state.croppedAvatarData = null;

        updateUserInterface();

        notify("Profile picture imeondolewa.");

    } catch (error) {
        console.error(
            "Remove profile picture error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    }
}


/* =========================================================
   17. CROPPER
   ========================================================= */

function handleProfilePictureSelect(event) {
    const file =
        event.target.files?.[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {
        notify(
            "Tafadhali chagua picha.",
            "error"
        );

        return;
    }

    const maxSize =
        5 * 1024 * 1024;

    if (file.size > maxSize) {
        notify(
            "Picha isiwe zaidi ya 5MB.",
            "error"
        );

        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function (e) {
        const image = $("cropImage");

        if (!image) {
            return;
        }

        image.src = e.target.result;

        openModal("cropModal");

        if (state.cropper) {
            state.cropper.destroy();
            state.cropper = null;
        }

        image.onload = function () {
            state.cropper =
                new Cropper(image, {
                    aspectRatio: 1,
                    viewMode: 1,
                    dragMode: "move",
                    autoCropArea: 1,
                    responsive: true,
                    background: false
                });
        };
    };

    reader.readAsDataURL(file);

    event.target.value = "";
}


function saveCroppedPicture() {
    if (!state.cropper) {
        notify(
            "Picha haijawa tayari.",
            "error"
        );

        return;
    }

    const canvas =
        state.cropper.getCroppedCanvas({
            width: 500,
            height: 500,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: "high"
        });

    if (!canvas) {
        notify(
            "Imeshindikana kukata picha.",
            "error"
        );

        return;
    }

    state.croppedAvatarData =
        canvas.toDataURL(
            "image/jpeg",
            0.85
        );

    closeModal("cropModal");

    /*
     * Preview immediately.
     */
    const profile = state.profile;

    if (profile) {
        profile[PROFILE_AVATAR_FIELD] =
            state.croppedAvatarData;

        updateAvatarUI();
    }

    notify(
        "Picha imeandaliwa. Bonyeza Save Profile ili kuhifadhi."
    );
}


function cancelCrop() {
    if (state.cropper) {
        state.cropper.destroy();
        state.cropper = null;
    }

    closeModal("cropModal");
}


/* =========================================================
   18. PAGE NAVIGATION
   ========================================================= */

const pageTitles = {
    dashboard: "Dashboard",
    products: "Products",
    stock: "Stock In",
    sales: "Sales",
    customers: "Customers",
    payments: "Payments",
    expenses: "Expenses",
    reports: "Reports"
};


function navigateToPage(pageName) {
    const target =
        $(pageName + "Page");

    if (!target) {
        return;
    }

    qsa(".content-page").forEach(page => {
        page.classList.remove("active-page");
    });

    target.classList.add("active-page");

    qsa(".nav-item").forEach(item => {
        item.classList.toggle(
            "active",
            item.dataset.page === pageName
        );
    });

    state.currentPage = pageName;

    if ($("pageTitle")) {
        $("pageTitle").textContent =
            pageTitles[pageName] ||
            pageName;
    }

    closeMobileSidebar();

    loadPageData(pageName);
}


/* =========================================================
   19. PAGE DATA LOADING
   ========================================================= */

async function loadPageData(pageName) {
    try {
        switch (pageName) {
            case "dashboard":
                await loadDashboard();
                break;

            case "products":
                await loadProducts();
                break;

            case "stock":
                await loadStock();
                break;

            case "sales":
                await loadSales();
                break;

            case "customers":
                await loadCustomers();
                break;

            case "payments":
                await loadPayments();
                break;

            case "expenses":
                await loadExpenses();
                break;

            case "reports":
                setDefaultReportDates();
                break;

            default:
                break;
        }

    } catch (error) {
        console.error(
            `Loading page ${pageName} error:`,
            error
        );
    }
}


/* =========================================================
   20. PRODUCTS
   ========================================================= */

async function loadProducts() {
    const body =
        $("productsTableBody");

    if (body) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="loading">
                    Inapakia...
                </td>
            </tr>`;
    }

    try {
        let data;
        let error;

        if (isOwner()) {
            const result =
                await supabaseClient
                    .rpc("get_products_for_owner");

            data = result.data;
            error = result.error;

        } else {
            const result =
                await supabaseClient
                    .rpc("get_products_for_sales");

            data = result.data;
            error = result.error;
        }

        if (error) {
            throw error;
        }

        state.products =
            Array.isArray(data)
                ? data
                : [];

        renderProducts();
        populateProductSelects();

    } catch (error) {
        console.error(
            "Load products error:",
            error
        );

        if (body) {
            body.innerHTML =
                `<tr>
                    <td colspan="7" class="empty-state">
                        ${escapeHTML(
                            friendlyError(error)
                        )}
                    </td>
                </tr>`;
        }
    }
}


function renderProducts() {
    const body =
        $("productsTableBody");

    if (!body) {
        return;
    }

    if (!state.products.length) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="empty-state">
                    Hakuna bidhaa.
                </td>
            </tr>`;

        return;
    }

    body.innerHTML =
        state.products.map(product => {

            const stock =
                Number(
                    product.stock_quantity ??
                    product.quantity ??
                    0
                );

            const lowStock =
                Number(
                    product.low_stock_level ??
                    0
                );

            let statusClass =
                "status-active";

            let statusText =
                "Active";

            if (!product.active) {
                statusClass =
                    "status-inactive";

                statusText =
                    "Inactive";

            } else if (stock <= 0) {
                statusClass =
                    "status-out";

                statusText =
                    "Out of Stock";

            } else if (
                lowStock > 0 &&
                stock <= lowStock
            ) {
                statusClass =
                    "status-low";

                statusText =
                    "Low Stock";
            }

            const action =
                isOwner()
                    ? `
                        <button
                            type="button"
                            class="table-action"
                            data-action="edit-product"
                            data-id="${escapeHTML(product.id)}"
                        >
                            Edit
                        </button>
                      `
                    : "—";

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(product.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            product.category || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            product.unit || "—"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            product.selling_price
                        )}
                    </td>

                    <td>
                        ${formatNumber(stock)}
                    </td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>

                    <td>
                        ${action}
                    </td>

                </tr>
            `;
        }).join("");
}


function populateProductSelects() {
    const stockSelect =
        $("stockProduct");

    if (stockSelect) {
        const current =
            stockSelect.value;

        stockSelect.innerHTML =
            `<option value="">
                Select Product
            </option>` +
            state.products
                .filter(product => product.active !== false)
                .map(product =>
                    `<option value="${escapeHTML(product.id)}">
                        ${escapeHTML(product.name)}
                    </option>`
                )
                .join("");

        if (current) {
            stockSelect.value = current;
        }
    }

    /*
     * Existing sale rows need to be rebuilt
     * separately because their stock unit
     * comes from product stock.
     */
}


/* =========================================================
   21. PRODUCT MODAL
   ========================================================= */

function openNewProductModal() {
    if (!isOwner()) {
        notify(
            "Ni Owner pekee anayeweza kuongeza bidhaa.",
            "error"
        );

        return;
    }

    $("productForm")?.reset();

    if ($("productId")) {
        $("productId").value = "";
    }

    if ($("productModalTitle")) {
        $("productModalTitle").textContent =
            "Add Product";
    }

    if ($("productBuyingPriceGroup")) {
        showElement($("productBuyingPriceGroup"));
    }

    openModal("productModal");
}


function openEditProductModal(productId) {
    if (!isOwner()) {
        return;
    }

    const product =
        state.products.find(
            item => item.id === productId
        );

    if (!product) {
        return;
    }

    $("productId").value =
        product.id;

    $("productName").value =
        product.name || "";

    $("productCategory").value =
        product.category || "";

    $("productUnit").value =
        product.unit || "Carton";

    $("productBuyingPrice").value =
        product.buying_price ?? "";

    $("productSellingPrice").value =
        product.selling_price ?? "";

    $("productLowStock").value =
        product.low_stock_level ?? 0;

    $("productModalTitle").textContent =
        "Edit Product";

    showElement(
        $("productBuyingPriceGroup")
    );

    openModal("productModal");
}


async function handleProductSave(event) {
    event.preventDefault();

    if (!isOwner()) {
        notify(
            "Only Owner can manage products.",
            "error"
        );

        return;
    }

    const id =
        $("productId")?.value;

    const name =
        $("productName")?.value.trim();

    const category =
        $("productCategory")?.value.trim();

    const unit =
        $("productUnit")?.value;

    const buyingPrice =
        Number(
            $("productBuyingPrice")?.value || 0
        );

    const sellingPrice =
        Number(
            $("productSellingPrice")?.value || 0
        );

    const lowStock =
        Number(
            $("productLowStock")?.value || 0
        );

    if (!name) {
        notify(
            "Jina la bidhaa linahitajika.",
            "error"
        );

        return;
    }

    if (sellingPrice < 0) {
        notify(
            "Selling price si sahihi.",
            "error"
        );

        return;
    }

    const button =
        $("saveProductBtn");

    setButtonLoading(
        button,
        true,
        "Inahifadhi..."
    );

    try {
        let result;

        if (id) {

            result =
                await supabaseClient
                    .from("products")
                    .update({
                        name,
                        category: category || null,
                        unit,
                        buying_price:
                            buyingPrice,
                        selling_price:
                            sellingPrice,
                        low_stock_level:
                            lowStock
                    })
                    .eq("id", id);

        } else {

            result =
                await supabaseClient
                    .from("products")
                    .insert({
                        name,
                        category: category || null,
                        unit,
                        buying_price:
                            buyingPrice,
                        selling_price:
                            sellingPrice,
                        low_stock_level:
                            lowStock,
                        active: true
                    });
        }

        if (result.error) {
            throw result.error;
        }

        closeModal("productModal");

        notify(
            id
                ? "Bidhaa imebadilishwa."
                : "Bidhaa imeongezwa."
        );

        await loadProducts();

    } catch (error) {
        console.error(
            "Save product error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


/* =========================================================
   22. STOCK IN
   ========================================================= */

async function loadStock() {
    const body =
        $("stockTableBody");

    if (body) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="loading">
                    Inapakia...
                </td>
            </tr>`;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("stock_in")
                .select(`
                    *,
                    products (
                        name
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        state.stock =
            Array.isArray(data)
                ? data
                : [];

        renderStock();

    } catch (error) {
        console.error(
            "Load stock error:",
            error
        );

        if (body) {
            body.innerHTML =
                `<tr>
                    <td colspan="7" class="empty-state">
                        ${escapeHTML(
                            friendlyError(error)
                        )}
                    </td>
                </tr>`;
        }
    }
}


function renderStock() {
    const body =
        $("stockTableBody");

    if (!body) {
        return;
    }

    if (!state.stock.length) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="empty-state">
                    Hakuna stock entries.
                </td>
            </tr>`;

        return;
    }

    body.innerHTML =
        state.stock.map(item => {

            const productName =
                item.products?.name ||
                state.products.find(
                    product =>
                        product.id === item.product_id
                )?.name ||
                "Unknown";

            return `
                <tr>

                    <td>
                        ${formatDate(item.created_at)}
                    </td>

                    <td>
                        ${escapeHTML(productName)}
                    </td>

                    <td>
                        ${formatNumber(item.quantity)}
                    </td>

                    <td>
                        ${escapeHTML(item.unit || "—")}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.invoice_no || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.supplier_name || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            item.recorded_by === state.user?.id
                                ? (
                                    state.profile?.full_name ||
                                    "You"
                                )
                                : "User"
                        )}
                    </td>

                </tr>
            `;
        }).join("");
}


function openStockModal() {
    $("stockForm")?.reset();

    if ($("stockUnit")) {
        $("stockUnit").value =
            "Carton";
    }

    /*
     * Buying price is visible only to Owner.
     */
    if (isOwner()) {
        showElement(
            $("stockBuyingPriceGroup")
        );
    } else {
        hideElement(
            $("stockBuyingPriceGroup")
        );
    }

    openModal("stockModal");
}


async function handleStockSave(event) {
    event.preventDefault();

    const productId =
        $("stockProduct")?.value;

    const quantity =
        Number(
            $("stockQuantity")?.value || 0
        );

    const unit =
        $("stockUnit")?.value;

    const invoiceNo =
        $("stockInvoiceNo")?.value.trim();

    const supplier =
        $("stockSupplier")?.value.trim();

    const notes =
        $("stockNotes")?.value.trim();

    const buyingPrice =
        Number(
            $("stockBuyingPrice")?.value || 0
        );

    if (!productId) {
        notify(
            "Chagua bidhaa.",
            "error"
        );

        return;
    }

    if (quantity <= 0) {
        notify(
            "Quantity lazima iwe zaidi ya zero.",
            "error"
        );

        return;
    }

    if (
        unit !== "Carton" &&
        unit !== "Crates"
    ) {
        notify(
            "Chagua Carton au Crates.",
            "error"
        );

        return;
    }

    const button =
        $("saveStockBtn");

    setButtonLoading(
        button,
        true,
        "Inahifadhi..."
    );

    try {
        const insertData = {
            product_id: productId,
            quantity,
            unit,
            invoice_no:
                invoiceNo || null,
            supplier_name:
                supplier || null,
            recorded_by:
                state.user.id,
            notes:
                notes || null
        };

        /*
         * Only Owner should submit buying price.
         * If Salesman records stock, DB/product buying
         * price remains the secure source.
         */
        if (isOwner()) {
            insertData.buying_price =
                buyingPrice > 0
                    ? buyingPrice
                    : null;
        }

        const { error } =
            await supabaseClient
                .from("stock_in")
                .insert(insertData);

        if (error) {
            throw error;
        }

        closeModal("stockModal");

        notify(
            "Stock imeongezwa."
        );

        await Promise.all([
            loadStock(),
            loadProducts()
        ]);

    } catch (error) {
        console.error(
            "Save stock error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


/* =========================================================
   23. CUSTOMERS
   ========================================================= */

async function loadCustomers() {
    const body =
        $("customersTableBody");

    if (body) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="loading">
                    Inapakia...
                </td>
            </tr>`;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("customers")
                .select("*")
                .order(
                    "name",
                    {
                        ascending: true
                    }
                );

        if (error) {
            throw error;
        }

        state.customers =
            Array.isArray(data)
                ? data
                : [];

        renderCustomers();
        populateCustomerSelects();

    } catch (error) {
        console.error(
            "Load customers error:",
            error
        );

        if (body) {
            body.innerHTML =
                `<tr>
                    <td colspan="7" class="empty-state">
                        ${escapeHTML(
                            friendlyError(error)
                        )}
                    </td>
                </tr>`;
        }
    }
}


function renderCustomers() {
    const body =
        $("customersTableBody");

    if (!body) {
        return;
    }

    if (!state.customers.length) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="empty-state">
                    Hakuna customers.
                </td>
            </tr>`;

        return;
    }

    body.innerHTML =
        state.customers.map(customer => {

            const balance =
                Number(
                    customer.current_balance || 0
                );

            const statusClass =
                customer.active === false
                    ? "status-inactive"
                    : "status-active";

            const statusText =
                customer.active === false
                    ? "Inactive"
                    : "Active";

            const actions =
                isOwner()
                    ? `
                        <button
                            type="button"
                            class="table-action"
                            data-action="edit-customer"
                            data-id="${escapeHTML(customer.id)}"
                        >
                            Edit
                        </button>
                      `
                    : "—";

            return `
                <tr>

                    <td>
                        <strong>
                            ${escapeHTML(customer.name)}
                        </strong>
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.phone || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customer.address || "—"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            customer.credit_limit
                        )}
                    </td>

                    <td>
                        ${formatCurrency(balance)}
                    </td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>

                    <td>
                        ${actions}
                    </td>

                </tr>
            `;
        }).join("");
}


function populateCustomerSelects() {
    const selects = [
        $("saleCustomer"),
        $("paymentCustomer")
    ];

    selects.forEach(select => {

        if (!select) {
            return;
        }

        const current =
            select.value;

        if (select.id === "saleCustomer") {

            select.innerHTML =
                `<option value="">
                    Walk-in Customer
                </option>`;

        } else {

            select.innerHTML =
                `<option value="">
                    Select Customer
                </option>`;
        }

        state.customers
            .filter(customer =>
                customer.active !== false
            )
            .forEach(customer => {

                const option =
                    document.createElement("option");

                option.value =
                    customer.id;

                option.textContent =
                    customer.name;

                select.appendChild(option);
            });

        if (current) {
            select.value = current;
        }
    });
}


function openNewCustomerModal() {
    $("customerForm")?.reset();

    $("customerId").value = "";

    openModal("customerModal");
}


function openEditCustomerModal(customerId) {
    if (!isOwner()) {
        notify(
            "Only Owner can edit customers.",
            "error"
        );

        return;
    }

    const customer =
        state.customers.find(
            item => item.id === customerId
        );

    if (!customer) {
        return;
    }

    $("customerId").value =
        customer.id;

    $("customerName").value =
        customer.name || "";

    $("customerPhone").value =
        customer.phone || "";

    $("customerAddress").value =
        customer.address || "";

    $("customerCreditLimit").value =
        customer.credit_limit ?? 0;

    $("customerNotes").value =
        customer.notes || "";

    openModal("customerModal");
}


async function handleCustomerSave(event) {
    event.preventDefault();

    const id =
        $("customerId")?.value;

    const name =
        $("customerName")?.value.trim();

    const phone =
        $("customerPhone")?.value.trim();

    const address =
        $("customerAddress")?.value.trim();

    const creditLimit =
        Number(
            $("customerCreditLimit")?.value || 0
        );

    const notes =
        $("customerNotes")?.value.trim();

    if (!name) {
        notify(
            "Jina la customer linahitajika.",
            "error"
        );

        return;
    }

    const button =
        $("saveCustomerBtn");

    setButtonLoading(
        button,
        true,
        "Inahifadhi..."
    );

    try {
        let result;

        const payload = {
            name,
            phone: phone || null,
            address: address || null,
            credit_limit:
                creditLimit,
            notes:
                notes || null
        };

        if (id) {

            if (!isOwner()) {
                throw new Error(
                    "Only Owner can edit customers."
                );
            }

            result =
                await supabaseClient
                    .from("customers")
                    .update(payload)
                    .eq("id", id);

        } else {

            result =
                await supabaseClient
                    .from("customers")
                    .insert({
                        ...payload,
                        current_balance: 0,
                        active: true
                    });
        }

        if (result.error) {
            throw result.error;
        }

        closeModal("customerModal");

        notify(
            id
                ? "Customer amebadilishwa."
                : "Customer ameongezwa."
        );

        await loadCustomers();

    } catch (error) {
        console.error(
            "Save customer error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


/* =========================================================
   24. PAYMENTS
   ========================================================= */

async function loadPayments() {
    const body =
        $("paymentsTableBody");

    if (body) {
        body.innerHTML =
            `<tr>
                <td colspan="6" class="loading">
                    Inapakia...
                </td>
            </tr>`;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("customer_payments")
                .select(`
                    *,
                    customers (
                        name
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        state.payments =
            Array.isArray(data)
                ? data
                : [];

        renderPayments();

    } catch (error) {
        console.error(
            "Load payments error:",
            error
        );

        if (body) {
            body.innerHTML =
                `<tr>
                    <td colspan="6" class="empty-state">
                        ${escapeHTML(
                            friendlyError(error)
                        )}
                    </td>
                </tr>`;
        }
    }
}


function renderPayments() {
    const body =
        $("paymentsTableBody");

    if (!body) {
        return;
    }

    if (!state.payments.length) {
        body.innerHTML =
            `<tr>
                <td colspan="6" class="empty-state">
                    Hakuna payments.
                </td>
            </tr>`;

        return;
    }

    body.innerHTML =
        state.payments.map(payment => {

            const customerName =
                payment.customers?.name ||
                "Unknown";

            return `
                <tr>

                    <td>
                        ${formatDate(
                            payment.created_at
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            customerName
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            payment.amount
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            payment.payment_method || "—"
                        )}
                    </td>

                    <td>
                        ${payment.recorded_by === state.user?.id
                            ? escapeHTML(
                                state.profile?.full_name ||
                                "You"
                            )
                            : "User"
                        }
                    </td>

                    <td>
                        ${escapeHTML(
                            payment.notes || "—"
                        )}
                    </td>

                </tr>
            `;
        }).join("");
}


function openPaymentModal() {
    $("paymentForm")?.reset();

    openModal("paymentModal");
}


async function handlePaymentSave(event) {
    event.preventDefault();

    const customerId =
        $("paymentCustomer")?.value;

    const amount =
        Number(
            $("paymentAmount")?.value || 0
        );

    const method =
        $("paymentMethod")?.value;

    const notes =
        $("paymentNotes")?.value.trim();

    if (!customerId) {
        notify(
            "Chagua customer.",
            "error"
        );

        return;
    }

    if (amount <= 0) {
        notify(
            "Amount lazima iwe zaidi ya zero.",
            "error"
        );

        return;
    }

    const button =
        $("savePaymentBtn");

    setButtonLoading(
        button,
        true,
        "Inahifadhi..."
    );

    try {
        const { error } =
            await supabaseClient
                .from("customer_payments")
                .insert({
                    customer_id:
                        customerId,
                    amount,
                    payment_method:
                        method,
                    recorded_by:
                        state.user.id,
                    notes:
                        notes || null
                });

        if (error) {
            throw error;
        }

        closeModal("paymentModal");

        notify(
            "Malipo yamehifadhiwa."
        );

        await Promise.all([
            loadPayments(),
            loadCustomers(),
            loadDashboard()
        ]);

    } catch (error) {
        console.error(
            "Save payment error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


/* =========================================================
   25. EXPENSES
   ========================================================= */

async function loadExpenses() {
    const body =
        $("expensesTableBody");

    if (body) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="loading">
                    Inapakia...
                </td>
            </tr>`;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("expenses")
                .select("*")
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        state.expenses =
            Array.isArray(data)
                ? data
                : [];

        renderExpenses();

    } catch (error) {
        console.error(
            "Load expenses error:",
            error
        );

        if (body) {
            body.innerHTML =
                `<tr>
                    <td colspan="7" class="empty-state">
                        ${escapeHTML(
                            friendlyError(error)
                        )}
                    </td>
                </tr>`;
        }
    }
}


function renderExpenses() {
    const body =
        $("expensesTableBody");

    if (!body) {
        return;
    }

    if (!state.expenses.length) {
        body.innerHTML =
            `<tr>
                <td colspan="7" class="empty-state">
                    Hakuna expenses.
                </td>
            </tr>`;

        return;
    }

    body.innerHTML =
        state.expenses.map(expense => {

            /*
             * Salesman cannot edit/delete.
             * Owner can manage expenses.
             */

            let actions = "—";

            if (isOwner()) {
                actions = `
                    <button
                        type="button"
                        class="table-action"
                        data-action="edit-expense"
                        data-id="${escapeHTML(expense.id)}"
                    >
                        Edit
                    </button>

                    <button
                        type="button"
                        class="table-action danger"
                        data-action="delete-expense"
                        data-id="${escapeHTML(expense.id)}"
                    >
                        Delete
                    </button>
                `;
            }

            return `
                <tr>

                    <td>
                        ${formatDate(
                            expense.created_at
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.expense_type || "—"
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.description || "—"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(
                            expense.amount
                        )}
                    </td>

                    <td>
                        ${escapeHTML(
                            expense.payment_method || "—"
                        )}
                    </td>

                    <td>
                        ${expense.recorded_by === state.user?.id
                            ? escapeHTML(
                                state.profile?.full_name ||
                                "You"
                            )
                            : "User"
                        }
                    </td>

                    <td>
                        ${actions}
                    </td>

                </tr>
            `;
        }).join("");
}


function openExpenseModal(expense = null) {
    $("expenseForm")?.reset();

    $("expenseForm").dataset.editingId =
        expense?.id || "";

    if (expense) {
        $("expenseType").value =
            expense.expense_type || "";

        $("expenseDescription").value =
            expense.description || "";

        $("expenseAmount").value =
            expense.amount ?? 0;

        $("expensePaymentMethod").value =
            expense.payment_method || "Cash";
    }

    openModal("expenseModal");
}


async function handleExpenseSave(event) {
    event.preventDefault();

    const form =
        $("expenseForm");

    const editingId =
        form?.dataset.editingId || "";

    const expenseType =
        $("expenseType")?.value.trim();

    const description =
        $("expenseDescription")?.value.trim();

    const amount =
        Number(
            $("expenseAmount")?.value || 0
        );

    const paymentMethod =
        $("expensePaymentMethod")?.value;

    if (!expenseType) {
        notify(
            "Expense type inahitajika.",
            "error"
        );

        return;
    }

    if (!description) {
        notify(
            "Description inahitajika.",
            "error"
        );

        return;
    }

    if (amount <= 0) {
        notify(
            "Amount lazima iwe zaidi ya zero.",
            "error"
        );

        return;
    }

    if (
        editingId &&
        !isOwner()
    ) {
        notify(
            "Salesman hawezi kubadilisha expense.",
            "error"
        );

        return;
    }

    const button =
        $("saveExpenseBtn");

    setButtonLoading(
        button,
        true,
        "Inahifadhi..."
    );

    try {
        let result;

        const payload = {
            expense_type:
                expenseType,
            description,
            amount,
            payment_method:
                paymentMethod
        };

        if (editingId) {

            result =
                await supabaseClient
                    .from("expenses")
                    .update(payload)
                    .eq("id", editingId);

        } else {

            result =
                await supabaseClient
                    .from("expenses")
                    .insert({
                        ...payload,
                        recorded_by:
                            state.user.id
                    });
        }

        if (result.error) {
            throw result.error;
        }

        delete form.dataset.editingId;

        closeModal("expenseModal");

        notify(
            editingId
                ? "Expense imebadilishwa."
                : "Expense imeongezwa."
        );

        await loadExpenses();

    } catch (error) {
        console.error(
            "Save expense error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


async function deleteExpense(expenseId) {
    if (!isOwner()) {
        return;
    }

    const confirmed =
        window.confirm(
            "Una uhakika unataka kufuta expense hii?"
        );

    if (!confirmed) {
        return;
    }

    try {
        const { error } =
            await supabaseClient
                .from("expenses")
                .delete()
                .eq("id", expenseId);

        if (error) {
            throw error;
        }

        notify(
            "Expense imefutwa."
        );

        await loadExpenses();

    } catch (error) {
        console.error(
            "Delete expense error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    }
}


/* =========================================================
   26. SALES
   ========================================================= */

async function loadSales() {
    const body =
        $("salesTableBody");

    if (body) {
        body.innerHTML =
            `<tr>
                <td colspan="9" class="loading">
                    Inapakia...
                </td>
            </tr>`;
    }

    try {
        const { data, error } =
            await supabaseClient
                .from("sales")
                .select(`
                    *,
                    customers (
                        name
                    )
                `)
                .order(
                    "created_at",
                    {
                        ascending: false
                    }
                );

        if (error) {
            throw error;
        }

        state.sales =
            Array.isArray(data)
                ? data
                : [];

        renderSales();

    } catch (error) {
        console.error(
            "Load sales error:",
            error
        );

        if (body) {
            body.innerHTML =
                `<tr>
                    <td colspan="9" class="empty-state">
                        ${escapeHTML(
                            friendlyError(error)
                        )}
                    </td>
                </tr>`;
        }
    }
}


function getSaleNumber(sale) {
    return (
        sale.sale_number ||
        sale.sale_no ||
        sale.invoice_number ||
        sale.id?.substring(0, 8) ||
        "—"
    );
}


function renderSales() {
    const body =
        $("salesTableBody");

    if (!body) {
        return;
    }

    if (!state.sales.length) {
        body.innerHTML =
            `<tr>
                <td colspan="9" class="empty-state">
                    Hakuna mauzo.
                </td>
            </tr>`;

        return;
    }

    body.innerHTML =
        state.sales.map(sale => {

            const customer =
                sale.customers?.name ||
                sale.customer_name ||
                "Walk-in Customer";

            const total =
                Number(
                    sale.total_amount || 0
                );

            const paid =
                Number(
                    sale.amount_paid || 0
                );

            const balance =
                Math.max(
                    0,
                    total - paid
                );

            return `
                <tr>

                    <td>
                        ${escapeHTML(
                            getSaleNumber(sale)
                        )}
                    </td>

                    <td>
                        ${formatDate(
                            sale.created_at
                        )}
                    </td>

                    <td>
                        ${escapeHTML(customer)}
                    </td>

                    <td>
                        ${escapeHTML(
                            sale.payment_method || "—"
                        )}
                    </td>

                    <td>
                        ${formatCurrency(total)}
                    </td>

                    <td>
                        ${formatCurrency(paid)}
                    </td>

                    <td>
                        ${formatCurrency(balance)}
                    </td>

                    <td>
                        ${sale.sold_by === state.user?.id
                            ? escapeHTML(
                                state.profile?.full_name ||
                                "You"
                            )
                            : "User"
                        }
                    </td>

                    <td>

                        <button
                            type="button"
                            class="table-action"
                            data-action="view-receipt"
                            data-id="${escapeHTML(sale.id)}"
                        >
                            Receipt
                        </button>

                    </td>

                </tr>
            `;
        }).join("");
}


/* =========================================================
   27. SALE ITEM HELPERS
   ========================================================= */

function createSaleItem() {
    return {
        id:
            "item-" +
            Date.now() +
            "-" +
            Math.random()
                .toString(36)
                .substring(2, 8),

        productId: "",
        quantity: 1,
        unit: "Carton",
        sellingPrice: 0
    };
}


function getProductById(productId) {
    return state.products.find(
        product =>
            product.id === productId
    );
}


function renderSaleItems() {
    const container =
        $("saleItemsContainer");

    if (!container) {
        return;
    }

    if (!state.currentSaleItems.length) {
        container.innerHTML =
            `<div class="empty-state">
                Bonyeza <strong>+ Add Item</strong>
                kuongeza bidhaa.
            </div>`;

        updateSaleTotal();

        return;
    }

    container.innerHTML =
        state.currentSaleItems.map(
            (item, index) => {

                const product =
                    getProductById(
                        item.productId
                    );

                const price =
                    product
                        ? Number(
                            product.selling_price || 0
                        )
                        : 0;

                item.sellingPrice =
                    price;

                const subtotal =
                    Number(item.quantity || 0) *
                    price;

                const productOptions =
                    state.products
                        .filter(
                            product =>
                                product.active !== false
                        )
                        .map(product =>
                            `<option
                                value="${escapeHTML(product.id)}"
                                ${product.id === item.productId
                                    ? "selected"
                                    : ""}
                            >
                                ${escapeHTML(product.name)}
                            </option>`
                        )
                        .join("");

                return `
                    <div
                        class="sale-item-row"
                        data-index="${index}"
                    >

                        <div class="form-group">

                            <label>
                                Product
                            </label>

                            <select
                                class="sale-product"
                                data-index="${index}"
                                required
                            >

                                <option value="">
                                    Select Product
                                </option>

                                ${productOptions}

                            </select>

                        </div>


                        <div class="form-group">

                            <label>
                                Quantity
                            </label>

                            <input
                                type="number"
                                class="sale-quantity"
                                data-index="${index}"
                                value="${escapeHTML(item.quantity)}"
                                min="0.01"
                                step="0.01"
                                required
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Unit
                            </label>

                            <select
                                class="sale-unit"
                                data-index="${index}"
                                required
                            >

                                <option
                                    value="Carton"
                                    ${item.unit === "Carton"
                                        ? "selected"
                                        : ""}
                                >
                                    Carton
                                </option>

                                <option
                                    value="Crates"
                                    ${item.unit === "Crates"
                                        ? "selected"
                                        : ""}
                                >
                                    Crates
                                </option>

                            </select>

                        </div>


                        <div class="form-group">

                            <label>
                                Selling Price
                            </label>

                            <input
                                type="text"
                                value="${formatCurrency(price)}"
                                readonly
                            >

                        </div>


                        <div class="sale-item-subtotal">

                            <span>
                                Subtotal
                            </span>

                            <strong>
                                ${formatCurrency(subtotal)}
                            </strong>

                        </div>


                        <button
                            type="button"
                            class="remove-sale-item"
                            data-index="${index}"
                            title="Remove item"
                        >
                            ×
                        </button>

                    </div>
                `;
            }
        ).join("");

    updateSaleTotal();
}


function updateSaleTotal() {
    let total = 0;

    state.currentSaleItems.forEach(item => {

        const product =
            getProductById(
                item.productId
            );

        if (!product) {
            return;
        }

        total +=
            Number(item.quantity || 0) *
            Number(product.selling_price || 0);
    });

    if ($("saleTotal")) {
        $("saleTotal").textContent =
            formatCurrency(total);
    }

    return total;
}


function addSaleItem() {
    if (!state.products.length) {
        notify(
            "Hakuna bidhaa. Ongeza bidhaa kwanza.",
            "error"
        );

        return;
    }

    state.currentSaleItems.push(
        createSaleItem()
    );

    renderSaleItems();
}


function removeSaleItem(index) {
    state.currentSaleItems.splice(
        index,
        1
    );

    renderSaleItems();
}


function openNewSaleModal() {
    if (!state.products.length) {
        notify(
            "Ongeza bidhaa kwanza kabla ya kufanya mauzo.",
            "error"
        );

        return;
    }

    $("saleForm")?.reset();

    state.currentSaleItems = [];

    addSaleItem();

    if ($("salePaymentMethod")) {
        $("salePaymentMethod").value =
            "Cash";
    }

    if ($("saleAmountPaid")) {
        $("saleAmountPaid").value = "0";
    }

    openModal("saleModal");
}


/* =========================================================
   28. SALE ITEM EVENT HANDLERS
========================================================= */

function handleSaleItemChange(event) {
    const target =
        event.target;

    const index =
        Number(
            target.dataset.index
        );

    if (
        Number.isNaN(index) ||
        !state.currentSaleItems[index]
    ) {
        return;
    }

    const item =
        state.currentSaleItems[index];

    if (
        target.classList.contains(
            "sale-product"
        )
    ) {
        item.productId =
            target.value;

        const product =
            getProductById(
                item.productId
            );

        item.sellingPrice =
            product
                ? Number(
                    product.selling_price || 0
                )
                : 0;

        renderSaleItems();

        return;
    }

    if (
        target.classList.contains(
            "sale-quantity"
        )
    ) {
        item.quantity =
            Number(
                target.value || 0
            );

        updateSaleTotal();

        return;
    }

    if (
        target.classList.contains(
            "sale-unit"
        )
    ) {
        item.unit =
            target.value;

        return;
    }
}


/* =========================================================
   29. VALIDATE SALE
========================================================= */

function validateSale() {
    if (!state.currentSaleItems.length) {
        return {
            valid: false,
            message: "Ongeza angalau bidhaa moja."
        };
    }

    for (
        const item of state.currentSaleItems
    ) {

        if (!item.productId) {
            return {
                valid: false,
                message: "Chagua bidhaa kwenye kila item."
            };
        }

        if (
            Number(item.quantity) <= 0
        ) {
            return {
                valid: false,
                message: "Quantity lazima iwe zaidi ya zero."
            };
        }

        if (
            item.unit !== "Carton" &&
            item.unit !== "Crates"
        ) {
            return {
                valid: false,
                message: "Unit lazima iwe Carton au Crates."
            };
        }
    }

    return {
        valid: true
    };
}


/* =========================================================
   30. SAVE SALE
========================================================= */

async function handleSaleSave(event) {
    event.preventDefault();

    const validation =
        validateSale();

    if (!validation.valid) {
        notify(
            validation.message,
            "error"
        );

        return;
    }

    const customerId =
        $("saleCustomer")?.value || null;

    const customerName =
        $("saleCustomerName")?.value.trim();

    const paymentMethod =
        $("salePaymentMethod")?.value;

    const amountPaid =
        Number(
            $("saleAmountPaid")?.value || 0
        );

    const notes =
        $("saleNotes")?.value.trim();

    const total =
        updateSaleTotal();

    if (total <= 0) {
        notify(
            "Total ya sale lazima iwe zaidi ya zero.",
            "error"
        );

        return;
    }

    if (amountPaid < 0) {
        notify(
            "Amount paid si sahihi.",
            "error"
        );

        return;
    }

    if (
        paymentMethod !== "Credit" &&
        amountPaid < total
    ) {
        notify(
            "Kwa Cash/Mobile Money/Bank, Amount Paid haiwezi kuwa chini ya total. Tumia Credit kwa deni.",
            "error"
        );

        return;
    }

    if (amountPaid > total) {
        notify(
            "Amount Paid haiwezi kuzidi total ya sale.",
            "error"
        );

        return;
    }

    if (
        paymentMethod === "Credit" &&
        !customerId
    ) {
        notify(
            "Credit sale lazima ihusishwe na customer.",
            "error"
        );

        return;
    }

    const button =
        $("saveSaleBtn");

    setButtonLoading(
        button,
        true,
        "Inahifadhi..."
    );

    let saleId = null;

    try {

        /*
         * 1. Create Sale
         */
        const salePayload = {
            customer_id:
                customerId,
            customer_name:
                customerName ||
                null,
            payment_method:
                paymentMethod,
            total_amount:
                total,
            amount_paid:
                amountPaid,
            sold_by:
                state.user.id,
            notes:
                notes || null
        };

        const {
            data: sale,
            error: saleError
        } =
            await supabaseClient
                .from("sales")
                .insert(salePayload)
                .select()
                .single();

        if (saleError) {
            throw saleError;
        }

        saleId =
            sale.id;

        /*
         * 2. Insert sale items
         *
         * Database triggers enforce:
         * - owner selling price
         * - owner buying price
         * - stock deduction
         */
        for (
            const item of state.currentSaleItems
        ) {

            const product =
                getProductById(
                    item.productId
                );

            if (!product) {
                throw new Error(
                    "Product haijapatikana."
                );
            }

            const {
                error: itemError
            } =
                await supabaseClient
                    .from("sale_items")
                    .insert({
                        sale_id:
                            saleId,
                        product_id:
                            item.productId,
                        quantity:
                            Number(item.quantity),
                        unit:
                            item.unit,
                        selling_price:
                            Number(
                                product.selling_price || 0
                            )
                    });

            if (itemError) {
                throw itemError;
            }
        }

        /*
         * 3. Find receipt created by DB trigger
         */
        let receipt =
            null;

        for (
            let attempt = 0;
            attempt < 5;
            attempt++
        ) {

            const {
                data: receiptData
            } =
                await supabaseClient
                    .from("receipts")
                    .select("*")
                    .eq("sale_id", saleId)
                    .maybeSingle();

            if (receiptData) {
                receipt =
                    receiptData;

                break;
            }

            await sleep(300);
        }

        closeModal("saleModal");

        state.currentSaleItems = [];

        notify(
            "Sale imehifadhiwa."
        );

        await Promise.all([
            loadSales(),
            loadProducts(),
            loadCustomers(),
            loadDashboard()
        ]);

        /*
         * Open receipt automatically.
         */
        if (receipt) {
            await showReceipt(
                saleId,
                receipt
            );
        } else {
            /*
             * Receipt trigger may not have returned yet.
             * User can still open from Sales table.
             */
            notify(
                "Sale imehifadhiwa. Receipt inapatikana kwenye Sales.",
                "warning"
            );
        }

    } catch (error) {
        console.error(
            "Save sale error:",
            error
        );

        /*
         * Important:
         * If sale was inserted but an item failed,
         * we do NOT automatically delete it because
         * database permissions may reject deletion.
         */
        notify(
            friendlyError(error),
            "error"
        );

    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


/* =========================================================
   31. RECEIPT
========================================================= */

async function showReceipt(
    saleId,
    receipt = null
) {
    try {

        const {
            data: sale,
            error: saleError
        } =
            await supabaseClient
                .from("sales")
                .select(`
                    *,
                    customers (
                        name
                    )
                `)
                .eq("id", saleId)
                .single();

        if (saleError) {
            throw saleError;
        }

        let itemData;
        let itemError;

        /*
         * Buying price is never requested here.
         */
        const result =
            await supabaseClient
                .rpc(
                    isOwner()
                        ? "get_sale_items_for_owner"
                        : "get_sale_items_for_sales",
                    {
                        p_sale_id:
                            saleId
                    }
                );

        itemData =
            result.data;

        itemError =
            result.error;

        if (itemError) {
            throw itemError;
        }

        renderReceipt(
            sale,
            itemData || [],
            receipt
        );

        openModal("receiptModal");

    } catch (error) {
        console.error(
            "Receipt error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );
    }
}


function renderReceipt(
    sale,
    items,
    receipt
) {
    if ($("receiptLogo")) {
        $("receiptLogo").src =
            LOGO_URL;
    }

    if ($("receiptNumber")) {
        $("receiptNumber").textContent =
            receipt?.receipt_number ??
            "—";
    }

    if ($("receiptSaleNumber")) {
        $("receiptSaleNumber").textContent =
            getSaleNumber(sale);
    }

    if ($("receiptDate")) {
        $("receiptDate").textContent =
            formatDate(sale.created_at);
    }

    if ($("receiptCustomer")) {
        $("receiptCustomer").textContent =
            sale.customers?.name ||
            sale.customer_name ||
            "Walk-in Customer";
    }

    const itemsBody =
        $("receiptItems");

    if (itemsBody) {

        if (!items.length) {

            itemsBody.innerHTML =
                `<tr>
                    <td colspan="5">
                        No items
                    </td>
                </tr>`;

        } else {

            itemsBody.innerHTML =
                items.map(item => {

                    const quantity =
                        Number(
                            item.quantity || 0
                        );

                    const price =
                        Number(
                            item.selling_price || 0
                        );

                    const subtotal =
                        Number(
                            item.subtotal ??
                            quantity * price
                        );

                    return `
                        <tr>

                            <td>
                                ${escapeHTML(
                                    item.product_name ||
                                    item.products?.name ||
                                    "Product"
                                )}
                            </td>

                            <td>
                                ${formatNumber(quantity)}
                            </td>

                            <td>
                                ${escapeHTML(
                                    item.unit || "—"
                                )}
                            </td>

                            <td>
                                ${formatCurrency(price)}
                            </td>

                            <td>
                                ${formatCurrency(subtotal)}
                            </td>

                        </tr>
                    `;
                }).join("");
        }
    }

    const total =
        Number(
            sale.total_amount || 0
        );

    const paid =
        Number(
            sale.amount_paid || 0
        );

    const balance =
        Math.max(
            0,
            total - paid
        );

    if ($("receiptTotal")) {
        $("receiptTotal").textContent =
            formatCurrency(total);
    }

    if ($("receiptPaid")) {
        $("receiptPaid").textContent =
            formatCurrency(paid);
    }

    if ($("receiptBalance")) {
        $("receiptBalance").textContent =
            formatCurrency(balance);
    }
}


function printReceipt() {
    const receiptArea =
        $("receiptPrintArea");

    if (!receiptArea) {
        return;
    }

    const printWindow =
        window.open(
            "",
            "_blank",
            "width=800,height=900"
        );

    if (!printWindow) {
        notify(
            "Browser imezuia print window.",
            "error"
        );

        return;
    }

    printWindow.document.write(`
        <!DOCTYPE html>

        <html>

        <head>

            <title>
                SGC SOFT DRINKS Receipt
            </title>

            <meta charset="UTF-8">

            <style>

                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 25px;
                    color: #111;
                }

                .receipt-print-area {
                    max-width: 700px;
                    margin: auto;
                }

                .receipt-header {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .receipt-logo {
                    max-width: 120px;
                    max-height: 100px;
                    object-fit: contain;
                }

                .receipt-header h2 {
                    margin: 8px 0 4px;
                }

                .receipt-header p {
                    margin: 0;
                }

                .receipt-meta {
                    border-top: 1px solid #ddd;
                    border-bottom: 1px solid #ddd;
                    padding: 12px 0;
                    margin-bottom: 15px;
                }

                .receipt-meta div {
                    margin: 4px 0;
                }

                .receipt-items-table {
                    width: 100%;
                    border-collapse: collapse;
                }

                .receipt-items-table th,
                .receipt-items-table td {
                    border-bottom: 1px solid #ddd;
                    padding: 8px;
                    text-align: left;
                }

                .receipt-totals {
                    margin-top: 20px;
                    margin-left: auto;
                    max-width: 300px;
                }

                .receipt-totals div {
                    display: flex;
                    justify-content: space-between;
                    padding: 6px 0;
                }

                .receipt-footer {
                    text-align: center;
                    margin-top: 30px;
                    border-top: 1px solid #ddd;
                    padding-top: 15px;
                }

            </style>

        </head>

        <body>

            ${receiptArea.outerHTML}

            <script>

                window.onload = function() {
                    window.print();

                    setTimeout(function() {
                        window.close();
                    }, 500);
                };

            <\/script>

        </body>

        </html>
    `);

    printWindow.document.close();
}


/* =========================================================
   32. DASHBOARD
========================================================= */

async function loadDashboard() {
    updateUserInterface();

    try {

        /*
         * Customer count and credit.
         */
        const {
            data: customers,
            error: customerError
        } =
            await supabaseClient
                .from("customers")
                .select(
                    "current_balance",
                    {
                        count: "exact"
                    }
                )
                .eq(
                    "active",
                    true
                );

        if (customerError) {
            throw customerError;
        }

        const customerCount =
            customers?.length || 0;

        const totalCredit =
            (customers || []).reduce(
                (sum, customer) =>
                    sum +
                    Number(
                        customer.current_balance || 0
                    ),
                0
            );

        if ($("dashboardCustomers")) {
            $("dashboardCustomers").textContent =
                formatNumber(customerCount);
        }

        if ($("dashboardCredit")) {
            $("dashboardCredit").textContent =
                formatCurrency(totalCredit);
        }

        /*
         * Today's sales.
         *
         * We fetch today's sales and sum them
         * on the client side.
         */
        const start =
            todayISO();

        const endDate =
            new Date(
                `${start}T23:59:59`
            );

        const {
            data: todaySales,
            error: salesError
        } =
            await supabaseClient
                .from("sales")
                .select(
                    "total_amount, created_at"
                )
                .gte(
                    "created_at",
                    `${start}T00:00:00`
                )
                .lte(
                    "created_at",
                    endDate.toISOString()
                );

        if (salesError) {
            throw salesError;
        }

        const salesTotal =
            (todaySales || []).reduce(
                (sum, sale) =>
                    sum +
                    Number(
                        sale.total_amount || 0
                    ),
                0
            );

        if ($("dashboardSales")) {
            $("dashboardSales").textContent =
                formatCurrency(salesTotal);
        }

    } catch (error) {
        console.error(
            "Dashboard error:",
            error
        );
    }
}


/* =========================================================
   33. REPORTS / P&L
========================================================= */

function setDefaultReportDates() {
    const start =
        $("reportStartDate");

    const end =
        $("reportEndDate");

    if (!start || !end) {
        return;
    }

    if (!start.value) {
        const date =
            new Date();

        date.setDate(
            date.getDate() - 30
        );

        start.value =
            date.toISOString()
                .split("T")[0];
    }

    if (!end.value) {
        end.value =
            todayISO();
    }
}


async function loadProfitLossReport() {
    if (!isOwner()) {
        notify(
            "Reports za Profit & Loss ni za Owner pekee.",
            "error"
        );

        return;
    }

    const startDate =
        $("reportStartDate")?.value;

    const endDate =
        $("reportEndDate")?.value;

    if (!startDate || !endDate) {
        notify(
            "Chagua start date na end date.",
            "error"
        );

        return;
    }

    if (startDate > endDate) {
        notify(
            "Start date haiwezi kuwa baada ya end date.",
            "error"
        );

        return;
    }

    const button =
        $("loadReportBtn");

    setButtonLoading(
        button,
        true,
        "Inapakia..."
    );

    try {

        const {
            data,
            error
        } =
            await supabaseClient
                .rpc(
                    "get_profit_loss_by_date",
                    {
                        start_date:
                            startDate,
                        end_date:
                            endDate
                    }
                );

        if (error) {
            throw error;
        }

        const report =
            normalizeProfitLoss(
                data
            );

        renderProfitLoss(
            report,
            startDate,
            endDate
        );

    } catch (error) {
        console.error(
            "P&L error:",
            error
        );

        notify(
            friendlyError(error),
            "error"
        );

    } finally {
        setButtonLoading(
            button,
            false
        );
    }
}


function normalizeProfitLoss(data) {
    let row = data;

    if (Array.isArray(data)) {
        row = data[0] || {};
    }

    if (!row) {
        row = {};
    }

    return {
        totalSales: Number(
            row.total_sales ??
            row.sales ??
            row.total_revenue ??
            0
        ),

        costOfGoods: Number(
            row.cost_of_goods ??
            row.cogs ??
            row.cost ??
            0
        ),

        grossProfit: Number(
            row.gross_profit ??
            row.grossprofit ??
            0
        ),

        expenses: Number(
            row.total_expenses ??
            row.expenses ??
            0
        ),

        netProfit: Number(
            row.net_profit ??
            row.netprofit ??
            0
        )
    };
}


function renderProfitLoss(
    report,
    startDate,
    endDate
) {
    if ($("reportTotalSales")) {
        $("reportTotalSales").textContent =
            formatCurrency(
                report.totalSales
            );
    }

    if ($("reportCostOfGoods")) {
        $("reportCostOfGoods").textContent =
            formatCurrency(
                report.costOfGoods
            );
    }

    if ($("reportGrossProfit")) {
        $("reportGrossProfit").textContent =
            formatCurrency(
                report.grossProfit
            );
    }

    if ($("reportExpenses")) {
        $("reportExpenses").textContent =
            formatCurrency(
                report.expenses
            );
    }

    if ($("reportNetProfit")) {
        $("reportNetProfit").textContent =
            formatCurrency(
                report.netProfit
            );
    }

    if ($("profitLossReport")) {
        $("profitLossReport").innerHTML = `
            <div class="report-details">

                <p>
                    <strong>
                        Period:
                    </strong>

                    ${escapeHTML(startDate)}
                    —
                    ${escapeHTML(endDate)}
                </p>

                <p>
                    <strong>
                        Total Sales:
                    </strong>

                    ${formatCurrency(
                        report.totalSales
                    )}
                </p>

                <p>
                    <strong>
                        Cost of Goods:
                    </strong>

                    ${formatCurrency(
                        report.costOfGoods
                    )}
                </p>

                <p>
                    <strong>
                        Gross Profit:
                    </strong>

                    ${formatCurrency(
                        report.grossProfit
                    )}
                </p>

                <p>
                    <strong>
                        Total Expenses:
                    </strong>

                    ${formatCurrency(
                        report.expenses
                    )}
                </p>

                <p>
                    <strong>
                        Net Profit:
                    </strong>

                    ${formatCurrency(
                        report.netProfit
                    )}
                </p>

            </div>
        `;
    }
}


/* =========================================================
   34. LANGUAGE
========================================================= */

async function changeLanguage(language) {
    if (
        language !== "sw" &&
        language !== "en"
    ) {
        language = "sw";
    }

    state.language =
        language;

    if (state.profile) {
        state.profile.language =
            language;
    }

    applyLanguage();

    if (state.user) {
        try {
            await supabaseClient
                .from("profiles")
                .update({
                    language,
                    updated_at:
                        new Date().toISOString()
                })
                .eq(
                    "id",
                    state.user.id
                );
        } catch (error) {
            console.error(
                "Language save error:",
                error
            );
        }
    }
}


function applyLanguage() {
    const t =
        translations[state.language];

    qsa(".nav-item").forEach(item => {

        const page =
            item.dataset.page;

        const span =
            item.querySelector(
                "span:last-child"
            );

        if (
            span &&
            t[page]
        ) {
            span.textContent =
                t[page];
        }
    });

    if ($("languageToggle")) {
        $("languageToggle").textContent =
            state.language === "sw"
                ? "🌐 English"
                : "🌐 Kiswahili";
    }
}


/* =========================================================
   35. MOBILE SIDEBAR
========================================================= */

function openMobileSidebar() {
    const sidebar =
        $("sidebar");

    const overlay =
        $("sidebarOverlay");

    if (sidebar) {
        sidebar.classList.add(
            "mobile-open"
        );
    }

    if (overlay) {
        overlay.classList.remove(
            "hidden"
        );
    }
}


function closeMobileSidebar() {
    const sidebar =
        $("sidebar");

    const overlay =
        $("sidebarOverlay");

    if (sidebar) {
        sidebar.classList.remove(
            "mobile-open"
        );
    }

    if (overlay) {
        overlay.classList.add(
            "hidden"
        );
    }
}


function toggleMobileSidebar() {
    const sidebar =
        $("sidebar");

    if (
        sidebar?.classList.contains(
            "mobile-open"
        )
    ) {
        closeMobileSidebar();
    } else {
        openMobileSidebar();
    }
}


/* =========================================================
   36. EVENT DELEGATION
========================================================= */

async function handleTableAction(event) {
    const button =
        event.target.closest(
            "[data-action]"
        );

    if (!button) {
        return;
    }

    const action =
        button.dataset.action;

    const id =
        button.dataset.id;

    if (!id) {
        return;
    }

    switch (action) {

        case "edit-product":
            openEditProductModal(id);
            break;

        case "edit-customer":
            openEditCustomerModal(id);
            break;

        case "edit-expense": {

            const expense =
                state.expenses.find(
                    item =>
                        item.id === id
                );

            if (expense) {
                openExpenseModal(
                    expense
                );
            }

            break;
        }

        case "delete-expense":
            await deleteExpense(id);
            break;

        case "view-receipt":
            await showReceipt(id);
            break;

        default:
            break;
    }
}


/* =========================================================
   37. GLOBAL CLICK EVENTS
========================================================= */

function handleGlobalClick(event) {

    /*
     * Modal close buttons
     */
    const closeButton =
        event.target.closest(
            "[data-close-modal]"
        );

    if (closeButton) {
        closeModal(
            closeButton.dataset.closeModal
        );

        return;
    }

    /*
     * Clicking modal overlay closes it.
     */
    if (
        event.target.classList.contains(
            "modal-overlay"
        )
    ) {
        const modal =
            event.target.closest(".modal");

        if (modal) {
            closeModal(modal.id);
        }

        return;
    }

    /*
     * Navigation
     */
    const nav =
        event.target.closest(
            ".nav-item"
        );

    if (nav) {
        navigateToPage(
            nav.dataset.page
        );

        return;
    }

    /*
     * Table actions
     */
    if (
        event.target.closest(
            "[data-action]"
        )
    ) {
        handleTableAction(event);
    }

    /*
     * Sale item remove
     */
    const removeItem =
        event.target.closest(
            ".remove-sale-item"
        );

    if (removeItem) {
        const index =
            Number(
                removeItem.dataset.index
            );

        removeSaleItem(index);
    }
}


/* =========================================================
   38. INITIALIZE EVENT LISTENERS
========================================================= */

function initializeEventListeners() {

    /* Login */
    $("loginForm")?.addEventListener(
        "submit",
        handleLogin
    );

    $("forgotPasswordBtn")?.addEventListener(
        "click",
        showForgotPasswordPage
    );

    $("backToLoginBtn")?.addEventListener(
        "click",
        showLoginPage
    );

    $("forgotPasswordForm")?.addEventListener(
        "submit",
        handleForgotPassword
    );


    /* Logout */
    $("logoutBtn")?.addEventListener(
        "click",
        handleLogout
    );


    /* Profile */
    $("profileMenu")?.addEventListener(
        "click",
        openProfileModal
    );

    $("currentUser")?.addEventListener(
        "click",
        openProfileModal
    );

    $("profileForm")?.addEventListener(
        "submit",
        handleProfileSave
    );

    $("profilePictureInput")?.addEventListener(
        "change",
        handleProfilePictureSelect
    );

    $("removeProfilePictureBtn")?.addEventListener(
        "click",
        removeProfilePicture
    );

    $("cropSaveBtn")?.addEventListener(
        "click",
        saveCroppedPicture
    );

    $("cropCancelBtn")?.addEventListener(
        "click",
        cancelCrop
    );


    /* Language */
    $("loginLanguage")?.addEventListener(
        "change",
        event => {
            state.language =
                event.target.value;

            applyLanguage();
        }
    );

    $("languageToggle")?.addEventListener(
        "click",
        () => {

            const next =
                state.language === "sw"
                    ? "en"
                    : "sw";

            changeLanguage(next);
        }
    );


    /* Mobile */
    $("menuToggle")?.addEventListener(
        "click",
        toggleMobileSidebar
    );

    $("sidebarOverlay")?.addEventListener(
        "click",
        closeMobileSidebar
    );


    /* Products */
    $("addProductBtn")?.addEventListener(
        "click",
        openNewProductModal
    );

    $("productForm")?.addEventListener(
        "submit",
        handleProductSave
    );


    /* Stock */
    $("addStockBtn")?.addEventListener(
        "click",
        openStockModal
    );

    $("stockForm")?.addEventListener(
        "submit",
        handleStockSave
    );


    /* Sales */
    $("newSaleBtn")?.addEventListener(
        "click",
        openNewSaleModal
    );

    $("saleForm")?.addEventListener(
        "submit",
        handleSaleSave
    );

    $("addSaleItemBtn")?.addEventListener(
        "click",
        addSaleItem
    );

    $("saleItemsContainer")?.addEventListener(
        "change",
        handleSaleItemChange
    );

    $("saleItemsContainer")?.addEventListener(
        "input",
        handleSaleItemChange
    );


    /* Customers */
    $("addCustomerBtn")?.addEventListener(
        "click",
        openNewCustomerModal
    );

    $("customerForm")?.addEventListener(
        "submit",
        handleCustomerSave
    );


    /* Payments */
    $("addPaymentBtn")?.addEventListener(
        "click",
        openPaymentModal
    );

    $("paymentForm")?.addEventListener(
        "submit",
        handlePaymentSave
    );


    /* Expenses */
    $("addExpenseBtn")?.addEventListener(
        "click",
        () => openExpenseModal()
    );

    $("expenseForm")?.addEventListener(
        "submit",
        handleExpenseSave
    );


    /* Reports */
    $("loadReportBtn")?.addEventListener(
        "click",
        loadProfitLossReport
    );


    /* Receipt */
    $("printReceiptBtn")?.addEventListener(
        "click",
        printReceipt
    );


    /* Global */
    document.addEventListener(
        "click",
        handleGlobalClick
    );


    /* Escape closes modal */
    document.addEventListener(
        "keydown",
        event => {

            if (event.key !== "Escape") {
                return;
            }

            const open =
                qs(".modal:not(.hidden)");

            if (open) {
                closeModal(open.id);
            }
        }
    );
}


/* =========================================================
   39. INITIAL APPLICATION LOAD
========================================================= */

async function initializeApplication() {

    updateUserInterface();

    applyLanguage();

    /*
     * Make sure Owner-only UI is correct.
     */
    if (isOwner()) {
        showElement(
            $("productBuyingPriceGroup")
        );
    } else {
        hideElement(
            $("productBuyingPriceGroup")
        );

        hideElement(
            $("stockBuyingPriceGroup")
        );
    }

    /*
     * Load essential data.
     */
    await Promise.all([
        loadProducts(),
        loadCustomers()
    ]);

    /*
     * Load current page.
     */
    await loadPageData(
        state.currentPage
    );
}


/* =========================================================
   40. AUTH STATE LISTENER
========================================================= */

function initializeAuthListener() {

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            console.log(
                "Auth event:",
                event
            );

            if (
                session?.user
            ) {
                state.user =
                    session.user;

                /*
                 * Do not perform heavy Supabase
                 * calls directly inside the auth
                 * callback without deferring.
                 */
                setTimeout(
                    async () => {

                        try {

                            await loadUserProfile();

                            showAppPage();

                            await initializeApplication();

                        } catch (error) {

                            console.error(
                                "Auth initialization error:",
                                error
                            );

                        }

                    },
                    0
                );

            } else {

                state.user = null;
                state.profile = null;
                state.role = null;

                showLoginPage();
            }
        }
    );
}


/* =========================================================
   41. INITIAL SESSION CHECK
========================================================= */

async function checkInitialSession() {

    try {

        const {
            data,
            error
        } =
            await supabaseClient.auth.getSession();

        if (error) {
            throw error;
        }

        if (data.session?.user) {

            state.user =
                data.session.user;

            await loadUserProfile();

            showAppPage();

            await initializeApplication();

        } else {

            showLoginPage();
        }

    } catch (error) {

        console.error(
            "Session error:",
            error
        );

        showLoginPage();
    }
}


/* =========================================================
   42. ERROR HANDLING
========================================================= */

function friendlyError(error) {

    if (!error) {
        return "Kuna tatizo lisilojulikana.";
    }

    const message =
        error.message ||
        String(error);

    const lower =
        message.toLowerCase();

    if (
        lower.includes(
            "invalid login credentials"
        )
    ) {
        return "Email au password si sahihi.";
    }

    if (
        lower.includes(
            "email not confirmed"
        )
    ) {
        return "Email yako bado haijathibitishwa.";
    }

    if (
        lower.includes(
            "row-level security"
        ) ||
        lower.includes(
            "permission denied"
        )
    ) {
        return "Huna ruhusa ya kufanya kitendo hiki.";
    }

    if (
        lower.includes(
            "duplicate"
        ) ||
        lower.includes(
            "already exists"
        )
    ) {
        return "Taarifa hii tayari ipo.";
    }

    if (
        lower.includes(
            "foreign key"
        )
    ) {
        return "Taarifa hii imeunganishwa na taarifa nyingine.";
    }

    if (
        lower.includes(
            "stock"
        ) &&
        (
            lower.includes(
                "insufficient"
            ) ||
            lower.includes(
                "not enough"
            )
        )
    ) {
        return "Stock haitoshi kwa mauzo haya.";
    }

    if (
        lower.includes(
            "credit limit"
        )
    ) {
        return "Mteja amefikia credit limit yake.";
    }

    if (
        lower.includes(
            "overpayment"
        )
    ) {
        return "Malipo haya yanazidi deni la mteja.";
    }

    return message;
}


/* =========================================================
   43. SMALL UTILITY
========================================================= */

function sleep(ms) {
    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                ms
            )
    );
}


/* =========================================================
   44. START APPLICATION
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "SGC SOFT DRINKS MANAGEMENT starting..."
        );

        /*
         * Ensure logo is used.
         */
        qsa(
            'img[src*="244759.png"]'
        ).forEach(img => {
            img.src = LOGO_URL;
        });

        initializeEventListeners();

        initializeAuthListener();

        await checkInitialSession();

        console.log(
            "SGC SOFT DRINKS MANAGEMENT ready."
        );
    }
);