const bill = document.querySelector('.bill');
const tip_labels = document.querySelectorAll('.tip_label');
const custom_tip = document.querySelector('.custom_tip');
const people_number = document.querySelector('.number_of_people');
const tip_amount = document.querySelector('.tip_amount');
const total_amount = document.querySelector('.total_amount');
const reset_button = document.querySelector('button');

const data = {
    bill: 0,
    tip: 0,
    number_of_people: 0,
    reset_data: false
}

const setResults = () => {
    reset_button.disabled = true;
    if (data.bill == 0 || data.number_of_people == 0 || data.tip == 0) return

    const tip = data.bill * (data.tip / 100);
    const total = data.bill + tip;
    tip_amount.innerText = (tip / data.number_of_people).toFixed(2);
    total_amount.innerText = (total / data.number_of_people).toFixed(2);

    reset_button.disabled = false;    
}

const resetFieldsValues = () => {
    // Reset Results elements values
    bill.value = '';
    people_number.value = '';
    custom_tip.value = ''; 
}

const resetResults = () => {
    tip_amount.innerText = '0.00';
    total_amount.innerText = '0.00';
    reset_button.disabled = true;
}

const reset = () => {
    proxy.reset_data = true;
    resetFieldsValues();
    resetResults();
}

// takes a field_name as input and returns an array containing two HTML elements
const errorElemnts = (field_name) => {
    const error_input = document.querySelector(`.${field_name}`);
    const error_span = document.querySelector(`.${field_name}_label span.error`);    
    return [error_input, error_span]
}

const showError = (field_name) => {
    const [error_input, error_span] = errorElemnts(field_name);
    error_span.style.display = 'block'
    error_input.classList.add('error');
}
const hideError = (field_name) => {
    const [error_input, error_span] = errorElemnts(field_name);
    error_span.style.display = 'none'
    error_input.classList.remove('error');
}

const resetActiveTip = () => {
    tip_labels.forEach(label => {
        const input = document.querySelector(`#${label.getAttribute('for')}`);
        label.classList.remove('active');
        input.checked = false;
    })
}

const setActiveTip = () => {
    const label = document.querySelector(`label[for="tip-${data.tip}"]`);
    const input = document.querySelector(`#${label.getAttribute('for')}`);
    resetActiveTip();
    label.classList.add('active');
    input.checked = true;
}

const checkPrice = (field, value) => {
    let price = value.toString().replace(',', '.');
    // Remove leading zeros except "0" or "0."
    if (price !== '0' && !price.startsWith('0.')) {
        price = price.replace(/^0+/, '');
    }
    // Validate the number with a maximum of two decimal places
    const isValid = /^(\d+\.?\d{0,2}|0\.?\d{0,2})$/.test(price);
    if (!isValid) {
        // Remove the last invalid character
        price = price.slice(0, -1);
    }
    if (field.value !== price) {
        field.value = price;
    }    

    return price;
};

const checkNum = (value) => {
    // Removes all non-numeric characters
    let cleanedValue = value.replace(/\D/g, '');
    // Removes leading zeros
    cleanedValue = cleanedValue.replace(/^0+/, '');
    // If the value is empty or 0, return an empty string
    if (cleanedValue === '' || Number(cleanedValue) === 0) {
        return '';
    }    
    return cleanedValue;
}

const checkValue = (field, callback) => {
    const newValue = callback(field.value);
    field.value = newValue; 
    return newValue;
}

const checkBillValue = (value) => {
    hideError('bill');
    let field_value = checkPrice(bill, value);
    if(field_value == 0){
        showError('bill');
    }
    return field_value;
}

const checkNumberOfPeople = () => {
    hideError('number_of_people');
    let field_value = checkValue(people_number, checkNum)
    if (field_value === ''){
        showError('number_of_people')
    }
    return field_value;
}

const checkTipValue = (value) => {    
    let field_value = value;
    if(custom_tip.value !== ''){
        resetActiveTip();
        field_value = checkValue(custom_tip, checkNum);
        if (field_value > 100){
            field_value = field_value.slice(0,2)
            custom_tip.value = field_value;
        }
    }
    return field_value;
}

const checkFieldValue = (property, value) => {
    if (property === 'bill'){        
        return checkBillValue(value)
    }
    if (property === 'number_of_people'){
        return checkNumberOfPeople(value);
    }
    if (property === 'tip'){        
        return checkTipValue(value);
    }
}

const handler = {
    set(target, property, value) {       
        if(property === 'reset_data' && value){
            resetActiveTip();
            target['bill'] = '';
            target['tip'] = '';
            target['number_of_people'] = '';
            return;
        } 
        const validValue = checkFieldValue(property,value);
        target[property] = parseFloat(validValue) || '';
        setResults();
        return true;
    },
}

const proxy = new Proxy(data, handler);

bill.addEventListener("input", (event) => {
    proxy.bill = event.target.value;
});

people_number.addEventListener("input", (event) => {    
    proxy.number_of_people = event.target.value;
});

tip_labels.forEach(label => {
    label.addEventListener('click', () => {     
        custom_tip.value = '';   
        const input = document.querySelector(`#${label.getAttribute('for')}`);
        proxy.tip = input.value
        setActiveTip();
    })
});

custom_tip.addEventListener('input', (event) => {
    proxy.tip = event.target.value;
});
