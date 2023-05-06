// navbar

const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () =>{
    if(scrollY >= 180){
        navbar.classList.add('bg');
    }else{
        navbar.classList.remove('bg');
    }
})

const createNavbar = () =>{
    let navbar = document.querySelector('.navbar');

    navbar.innerHTML += `
    <ul class="links-container">
        <li class="link-item"><a href="index.html" class="link active">Home</a></li>
        <li class="link-item"><a href="404.html" class="link">Product</a></li>
        <li class="link-item"><a href="about.html" class="link">About</a></li>
        <li class="link-item"><a href="contact.html" class="link">Contact</a></li>
    </ul>
    <div class="user-interactions">
         <div class="cart">
            <a href="cart.html">
            <img src="img/cart.png" class="cart-icon" alt="">
            <span class="cart-item-count">00</span>
            </a>
         </div>
         <div class="user">
            <img src="img/user.png" class="user-icon" alt="">
            <div class="user-icon-popup">
                <p>login to your account</p>
                <a href= "login.html">login</a>
            </div>
         </div>
    </div>
    `
}

createNavbar();

// user icon popup

let userIcon = document.querySelector('.user-icon');
let userPopupIcon = document.querySelector('.user-icon-popup');

userIcon.addEventListener('click', () => userPopupIcon.classList.toggle('active'))

let text = userPopupIcon.querySelector('p');
let actionBtn = userPopupIcon.querySelector('a');
let user = JSON.parse(sessionStorage.user || null);

if(user != null){ // user is logged in
    text.innerHTML = `log in as, ${user.name}`;
    actionBtn.innerHTML = 'log out';
    actionBtn.addEventListener('click', () => logout());
} else{
    text.innerHTML = 'login to your account';
    actionBtn.innerHTML = 'login';
    actionBtn.addEventListener('click', () => location.href = '/login')
}

const logout = () => {
    sessionStorage.clear()
    location.reload();
}