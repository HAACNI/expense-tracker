document.getElementById("login").addEventListener("submit", function(e){
    e.preventDefault();

    const email = document.getElementsByName('email')[0].value.trim();
    const password = document.getElementsByName('password')[0].value.trim();

    const users = JSON.parse(localStorage.getItem('users')) || [];

    console.log("Entered:", email, password);
    console.log("Stored users:", users);

    const validUser = users.find(function(user){
        console.log("Checking user:", user.email, user.password);
        return user.email === email && user.password === password;
    });

    console.log("Result:", validUser);

    if(validUser){
        localStorage.setItem("loggedInUser", JSON.stringify(validUser));
        alert('Login successful!');
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid email or password.');
    }
});