console.log('Signup script loaded');
document.getElementById('signup').addEventListener('submit',function(e){
    e.preventDefault();
    const name= document.getElementsByName('name')[0].value;
    const email= document.getElementsByName('email')[0].value;
    const password= document.getElementsByName('password')[0].value;
    const confirmpassword= document.getElementsByName('confirmpassword')[0].value;

    const user={ name,email,password,confirmpassword};
    let users=JSON.parse(localStorage.getItem('users')) || [];
    users.push(user);
    localStorage.setItem('users',JSON.stringify(users));
    alert('Signup successful!');
});