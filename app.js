// app.js
function getExpenses() {
    const expenses = localStorage.getItem('expenses');
    return expenses ? JSON.parse(expenses) : [];
}

function saveExpense(expense) {
    const expenses = getExpenses();
    expenses.push(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function addExpense() {
    const description = document.getElementById('description').value;
    const amount = document.getElementById('amount').value;
    const category = document.getElementById('category').value;
    const date = document.getElementById('date').value;

    if (description && amount && category && date) {
        const expense = {
            id: Date.now(),
            description,
            amount: parseFloat(amount),
            category,
            date
        };
        saveExpense(expense);
        alert('Expense added successfully!');
        document.querySelector('form').reset();
        window.location.href = 'expenses.html';
    } else {
        alert('Please fill all fields');
    }
}

function renderExpenses(filteredExpenses = null) {
    const expensesTable = document.getElementById('expenses-table-body');
    if (!expensesTable) return;

    const expenses = filteredExpenses || getExpenses();
    expensesTable.innerHTML = '';
    
    // Reverse to show newest first
    expenses.slice().reverse().forEach(exp => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${exp.date}</td>
            <td>${exp.description}</td>
            <td>${exp.category}</td>
            <td>-</td>
            <td>₹${exp.amount}</td>
            <td><a href="#" onclick="deleteExpense(${exp.id})">Delete</a></td>
        `;
        expensesTable.appendChild(row);
    });
}

function applyFilters() {
    const month = document.getElementById('filter-month').value;
    const category = document.getElementById('filter-category').value.toLowerCase();
    const search = document.getElementById('filter-search').value.toLowerCase();

    let expenses = getExpenses();

    if (month !== 'all') {
        expenses = expenses.filter(exp => exp.date.split('-')[1] === month);
    }
    if (category !== 'all') {
        expenses = expenses.filter(exp => exp.category.toLowerCase() === category);
    }
    if (search) {
        expenses = expenses.filter(exp => exp.description.toLowerCase().includes(search));
    }

    renderExpenses(expenses);
}

function deleteExpense(id) {
    let expenses = getExpenses();
    expenses = expenses.filter(exp => exp.id !== id);
    localStorage.setItem('expenses', JSON.stringify(expenses));
    renderExpenses();
    renderOverview();
}

function renderOverview() {
    const overviewContainer = document.getElementById('overview-summary');
    if (!overviewContainer) return;

    const expenses = getExpenses();
    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    const totalEl = document.getElementById('total-expenses');
    if (totalEl) totalEl.innerText = `₹${total}`;
    
    const countEl = document.getElementById('total-transactions');
    if (countEl) countEl.innerText = expenses.length;

    // Calculate this month's total
    const currentMonth = new Date().toISOString().slice(5, 7);
    const thisMonthExpenses = expenses.filter(exp => exp.date.split('-')[1] === currentMonth);
    const thisMonthTotal = thisMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const thisMonthEl = document.getElementById('this-month-total');
    if (thisMonthEl) thisMonthEl.innerText = `₹${thisMonthTotal}`;

    // Top Category
    const data = getCategoryData();
    let topCat = '-';
    let maxSpent = 0;
    for (const [cat, info] of Object.entries(data)) {
        if (info.total > maxSpent) {
            maxSpent = info.total;
            topCat = cat.charAt(0).toUpperCase() + cat.slice(1);
        }
    }
    const topCatEl = document.getElementById('top-category');
    if (topCatEl) topCatEl.innerText = topCat;

    const recentTable = document.getElementById('recent-expenses-body');
    if (recentTable) {
        recentTable.innerHTML = '';
        expenses.slice(-3).reverse().forEach(exp => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${exp.date}</td>
                <td>${exp.description}</td>
                <td>${exp.category}</td>
                <td>₹${exp.amount}</td>
            `;
            recentTable.appendChild(row);
        });
    }

    renderOverviewChart();
}

function saveBudget() {
    const budgetInput = document.getElementById('budget-input');
    const monthInput = document.getElementById('budget-month');
    if (!budgetInput || !monthInput) return;
    
    const budget = parseFloat(budgetInput.value);
    const month = monthInput.value;

    if (!month) {
        alert('Please select a month first');
        return;
    }

    if (!isNaN(budget) && budget > 0) {
        localStorage.setItem(`budget_${month}`, budget);
        alert('Budget saved successfully!');
        renderBudget();
    } else {
        alert('Please enter a valid budget amount');
    }
}

function renderBudget() {
    const budgetUsedEl = document.getElementById('budget-used');
    const budgetInput = document.getElementById('budget-input');
    const monthInput = document.getElementById('budget-month');
    if (!budgetUsedEl || !monthInput) return;

    if (!monthInput.value) {
        monthInput.value = new Date().toISOString().slice(0, 7);
    }

    const month = monthInput.value;
    const budget = parseFloat(localStorage.getItem(`budget_${month}`)) || 0;
    
    if (budget > 0) {
        if(budgetInput) budgetInput.value = budget;
        
        const expenses = getExpenses();
        const monthlyExpenses = expenses.filter(exp => exp.date.startsWith(month));
        const total = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        
        const percentage = Math.min(100, (total / budget) * 100).toFixed(1);
        budgetUsedEl.innerText = `Budget Used: ${percentage}% (₹${total} / ₹${budget})`;
    } else {
        if(budgetInput) budgetInput.value = '';
        budgetUsedEl.innerText = `Budget Used: 0%`;
    }
}

function getCategoryData() {
    const expenses = getExpenses();
    const data = {};
    expenses.forEach(exp => {
        const cat = exp.category.toLowerCase();
        if (!data[cat]) {
            data[cat] = { total: 0, count: 0 };
        }
        data[cat].total += exp.amount;
        data[cat].count += 1;
    });
    return data;
}

function renderCategories() {
    const categoryContainer = document.getElementById('categories-summary');
    if (!categoryContainer) return;

    const data = getCategoryData();
    categoryContainer.innerHTML = '';

    const icons = {
        food: '🍔',
        transport: '🚗',
        shopping: '🛍',
        bills: '💡',
        entertainment: '🎬',
        other: '📦'
    };

    if (Object.keys(data).length === 0) {
        categoryContainer.innerHTML = '<p>No expenses found.</p>';
        return;
    }

    Object.keys(data).forEach(cat => {
        const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
        const icon = icons[cat] || '📊';
        
        const card = document.createElement('div');
        card.className = 'summary-card';
        card.innerHTML = `
            <h3>${icon} ${catName}</h3>
            <p>Total Spent: ₹${data[cat].total}</p>
            <p>Transactions: ${data[cat].count}</p>
        `;
        categoryContainer.appendChild(card);
    });
}

function renderAnalytics() {
    const breakdownList = document.getElementById('category-breakdown-list');
    if (!breakdownList) return;

    const data = getCategoryData();
    breakdownList.innerHTML = '';

    if (Object.keys(data).length === 0) {
        breakdownList.innerHTML = '<li>No data available</li>';
        return;
    }

    Object.keys(data).forEach(cat => {
        const catName = cat.charAt(0).toUpperCase() + cat.slice(1);
        const li = document.createElement('li');
        li.innerText = `${catName} – ₹${data[cat].total}`;
        breakdownList.appendChild(li);
    });

    renderCategoryChart();
    renderMonthlyChart();
}

// Chart Rendering Functions

let categoryChartInstance = null;
function renderCategoryChart() {
    const ctx = document.getElementById('category-chart');
    if (!ctx) return;
    
    if (categoryChartInstance) categoryChartInstance.destroy();

    const data = getCategoryData();
    const categories = Object.keys(data).map(cat => cat.charAt(0).toUpperCase() + cat.slice(1));
    const totals = Object.values(data).map(info => info.total);
    
    categoryChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: categories,
            datasets: [{
                label: 'Spending by Category',
                data: totals,
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

let monthlyChartInstance = null;
function renderMonthlyChart() {
    const ctx = document.getElementById('monthly-chart');
    if (!ctx) return;
    
    if (monthlyChartInstance) monthlyChartInstance.destroy();

    const expenses = getExpenses();
    const monthlyTotals = {};
    
    expenses.forEach(exp => {
        const month = exp.date.substring(0, 7);
        monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });
    
    const sortedMonths = Object.keys(monthlyTotals).sort();
    const totals = sortedMonths.map(month => monthlyTotals[month]);
    
    monthlyChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Monthly Spending',
                data: totals,
                backgroundColor: '#36A2EB'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

let overviewChartInstance = null;
function renderOverviewChart() {
    const ctx = document.getElementById('overview-chart');
    if (!ctx) return;
    
    if (overviewChartInstance) overviewChartInstance.destroy();

    const expenses = getExpenses();
    const monthlyTotals = {};
    
    expenses.forEach(exp => {
        const month = exp.date.substring(0, 7);
        monthlyTotals[month] = (monthlyTotals[month] || 0) + exp.amount;
    });
    
    const sortedMonths = Object.keys(monthlyTotals).sort();
    const totals = sortedMonths.map(month => monthlyTotals[month]);
    
    overviewChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [{
                label: 'Total Expenses',
                data: totals,
                borderColor: '#4BC0C0',
                tension: 0.1,
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true } }
        }
    });
}

window.onload = function() {
    renderExpenses();
    renderOverview();
    renderBudget();
    renderCategories();
    renderAnalytics();
};
