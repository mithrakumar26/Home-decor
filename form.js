window.onload = () => {
    if(sessionStorage.User){
        User = JSON.parse(sessionStorage.User);
        if(User.email){
            location.replace('/');
        }
    }
}

// form
let formBtn = document.querySelector('.submit-btn');
let loader = document.querySelector('.loader');

formBtn.addEventListener('click', () => {
    let fullname = document.querySelector('#name') || null;
    let email = document.querySelector('#email');
    let password = document.querySelector('#password');
    let number = document.querySelector('#number') || null;
    let tac = document.querySelector('#tc') || null;

    if(fullname != null){ // signup page
        // form validation
        if(fullname.value.length < 3){
            ShowFormError('name must be 3 letters long');
        } else if(!email.value.length){
            ShowFormError('enter your email');
        } else if(password.value.length < 8){
            ShowFormError('password must be 8 letters long');
        } else if(!Number(number) || number.value.length < 10){
            ShowFormError('Invalid number, Please enter valid one');
        } else if(!tac.checked){
            ShowFormError('You must agree to our terms and condition');
        } else{
            // submit form
            loader.style.display = 'block';
            sendData('/signup', {
                name: fullname.value,
                email: email.value,
                password: password.value,
                number: number.value,
                tac: tac.checked
            })
        }
    } else{// login page
        if(!email.value.length || !password.value.length){
            ShowFormError('fill all the inputs')
        } else{
            // submit form
            loader.style.display = 'block';
            sendData('/login', {
                email: email.value,
                password: password.value
            })
        }
    }
})