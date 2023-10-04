const CLASS_NAME_SELECT = 'select';
const CLASS_NAME_ACTIVE = 'select_show';
const CLASS_NAME_SELECTED = 'select__option_selected';
const SELECTOR_ACTIVE = '.select_show';
const SELECTOR_DATA = '[data-select]';
const SELECTOR_DATA_TOGGLE = '[data-select="toggle"]';
const SELECTOR_OPTION_SELECTED = '.select__option_selected';

class CustomSelect {
    constructor(target, params) {
        this._elRoot = typeof target === 'string' ? document.querySelector(target) : target;
        this._params = params || {};

        if (this._params['options']) {
            this._elRoot.classList.add(CLASS_NAME_SELECT);
            this._elRoot.innerHTML = CustomSelect.template(this._elRoot, this._params);
        }
        this._elToggle = this._elRoot.querySelector(SELECTOR_DATA_TOGGLE);
        this._elHidden = this._elRoot.querySelector('input[type=hidden]');

        this._elRoot.addEventListener('click', this._onClick.bind(this, 'click'));
        this._elToggle.addEventListener('focus', this._onClick.bind(this, 'focus'));
        this._elToggle.addEventListener('focusout', this._onBlur.bind(this));

        if (this._params.search) this._oninput(this._elRoot, this._params);
        this.afterInit();
    }
    _onBlur(e){
        if (e.relatedTarget !== null){
            this.hide();
        }
    }
    _onClick(eventType, e) {
        if (eventType === 'focus'){
            setTimeout(() => {
                this.show();
            }, 300)
        }else {
            const target = e.target;
            if (target.closest(SELECTOR_DATA) !== null){
                const type = target.closest(SELECTOR_DATA).dataset.select;

                switch (type) {
                    case 'toggle':
                        this.toggle();
                        break;
                    case 'option':
                        this._changeValue(target);
                        break;
                }
            }
        }
    }
    _update(option) {
        option = option.closest('.select__option');

        const selected = this._elRoot.querySelector(SELECTOR_OPTION_SELECTED);


        if (selected) {
            selected.classList.remove(CLASS_NAME_SELECTED);
        }
        option.classList.add(CLASS_NAME_SELECTED);
        if (this._elToggle.dataset.type === 'search'){
            this._elToggle.value = option.textContent;
            this._elHidden.value = option.dataset['value'];

            let blurEvent = new Event('blur');
            this._elToggle.dispatchEvent(blurEvent);

        }else {
            this._elToggle.textContent = option.textContent;
            this._elToggle.value = option.dataset['value'];
            this._elRoot.classList.add('_selected');
        }
        this._elToggle.dataset.index = option.dataset['index'];
        this._elRoot.dispatchEvent(new CustomEvent('select.change'));
        this._params.onSelected ? this._params.onSelected(this, option) : null;

        return option.dataset['value'];
    }
    _reset() {
        const selected = this._elRoot.querySelector(SELECTOR_OPTION_SELECTED);
        if (selected) {
            selected.classList.remove(CLASS_NAME_SELECTED);
        }
        this._elToggle.textContent = 'Выберите из списка';
        this._elToggle.value = '';
        this._elToggle.dataset.index = -1;
        this._elRoot.dispatchEvent(new CustomEvent('select.change'));
        this._params.onSelected ? this._params.onSelected(this, null) : null;
        return '';
    }
    _changeValue(option) {
        if (option.classList.contains(CLASS_NAME_SELECTED)) {
            // console.log('1');
            this.hide();
            return;
        }
        // console.log('2');
        this._update(option);
        this.hide();
    }
    _oninput(elem, params){
        this._elToggle.addEventListener('input', () => {
            let value = this._elToggle.value.trim();
            let items = [];

            if (value !== ''){

                params.options.forEach((option, index) => {
                    let hide = '_hide',
                        text = option[1];

                    if (text.toLowerCase().search(value.toLowerCase()) !== -1){
                        hide = '';
                        text = this._insertMark(text, text.toLowerCase().search(value.toLowerCase()), value.length);
                    }

                    items.push(`<li class="select__option ${hide}" data-select="option" data-value="${option[0]}" data-index="${index}">${text}</li>`);
                })

                this._elRoot.querySelector('.select__options').innerHTML = items.join('');
            }else {
                let items = [];
                params.options.forEach((option, index) => {
                    items.push(`<li class="select__option" data-select="option" data-value="${option[0]}" data-index="${index}">${option[1]}</li>`);
                })
                this._elRoot.querySelector('.select__options').innerHTML = items.join('');
            }

            this._elRoot.dispatchEvent(new CustomEvent('select.input'));
        })
    }
    _insertMark(string, pos, length){
        return string.slice(0, pos) + '<mark>' + string.slice(pos, pos + length) + '</mark>' + string.slice(pos + length);
    }
    show() {
        document.querySelectorAll(SELECTOR_ACTIVE).forEach(select => {
            select.classList.remove(CLASS_NAME_ACTIVE);
        });
        this._elRoot.classList.add(CLASS_NAME_ACTIVE);
    }
    hide() {
        this._elRoot.classList.remove(CLASS_NAME_ACTIVE);
    }
    toggle() {
        //console.log('tgl');
        if (this._elRoot.classList.contains(CLASS_NAME_ACTIVE)) {
            this.hide();
            // let blurEvent = new Event('blur');
            // this._elToggle.dispatchEvent(blurEvent);
        } else {
            this.show();
            // let focusEvent = new Event('focus');
            // this._elToggle.dispatchEvent(focusEvent);
        }
    }
    dispose() {
        this._elRoot.removeEventListener('click', this._onClick);
    }
    get value() {
        return this._elToggle.value;
    }
    set value(value) {
        let isExists = false;
        this._elRoot.querySelectorAll('.select__option').forEach((option) => {
            if (option.dataset['value'] === value) {
                isExists = true;
                return this._update(option);
            }
        });
        if (!isExists) {
            return this._reset();
        }
    }
    get selectedIndex() {
        return this._elToggle.dataset['index'];
    }
    set selectedIndex(index) {
        const option = this._elRoot.querySelector(`.select__option[data-index="${index}"]`);
        if (option) {
            return this._update(option);
        }
        return this._reset();
    }
    set option(data){
        this._params['options'] = [];
        this._params['options'] = data;
        this.updateOptions();
    }
    updateOptions(){
        const options = this._params['options'];
        let items = [];

        if (options.length > 0){
            options.forEach((option, index) => {
                let text = option[1],
                    value = this._elToggle.value;

                // console.log(text);

                if (text.toLowerCase().search(value.toLowerCase()) !== -1){
                    text = this._insertMark(text, text.toLowerCase().search(value.toLowerCase()), value.length);
                }

                items.push(`<li class="select__option " data-select="option" data-value="${option[0]}" data-index="${index}">${text}</li>`);
            });
        }else {
            items.push(`<li class="select__option _click-disabled" data-select="option" data-value="" data-index="-1">${this._elRoot.dataset.i18Empty}</li>`);
        }

        this._elRoot.querySelector('.select__dropdown').classList.remove('_empty');
        this._elRoot.querySelector('.select__options').innerHTML = items.join('');
    }
    afterInit(){
        this._elToggle.addEventListener('focus', (e) => {
            if (e.isTrusted){
                // console.log('ds');
                // this.show();
            }

            // this.toggle();
            // this.show();
            // let blurClick = new Event('click');
            // this._elRoot.dispatchEvent(blurClick);
            //     if (!this._elToggle.classList.contains('select_show')){
            //         this._elToggle.classList.add('select_show');
            //     }
        })
    }
}

CustomSelect.template = (elRoot ,params) => {
    const name = params['name'];
    const options = params['options'];
    const targetValue = params['targetValue'];
    let select_type;
    let items = [];
    let selectedIndex = -1;
    let selectedValue = '';
    let selectedContent = 'Выберите из списка';
    let placeholder = (params.placeholder !== undefined) ? params.placeholder :'Оберіть із списку або введіть';
    let placeholder_button = (params.placeholder !== undefined) ? params.placeholder :'Оберіть із списку';


    options.forEach((option, index) => {
        let selectedClass = '';
        if (option[0] === targetValue) {
            selectedClass = ' select__option_selected';
            selectedIndex = index;
            selectedValue = option[0];
            selectedContent = option[1];
        }
        items.push(`<li class="select__option${selectedClass}" data-select="option" data-value="${option[0]}" data-index="${index}">${option[1]}</li>`);
    });

    if (params.search){
        let input_trigger = `<input type="text" class="select__input" placeholder="${placeholder}" value="${selectedContent}" data-select="toggle" data-type="search" data-index="${selectedIndex}" onblur="selectHandlerBlur(this)" autocomplete="none">`;
        if (selectedValue === '') {
            input_trigger = `<input type="text" placeholder="${placeholder}" class="select__input" data-select="toggle" data-type="search" data-index="${selectedIndex}" onblur="selectHandlerBlur(this)" autocomplete="none">`;
        }
        select_type = `
            <div class="select__toggle">
                ${input_trigger}
                <input type="hidden" value="${selectedValue}" name="${name}">
            </div>
        `;
    }else {
        select_type = `
            <div class="select__toggle">       
                <button type="button" name="${name}" value="${selectedValue}" data-type="button" data-select="toggle" data-index="${selectedIndex}" onblur="selectHandlerBlur(this)">${placeholder_button}</button>
            </div>
        `;
    }
    let block_error = '';
    if (elRoot.closest('.required')){
        block_error = `<div class="help-block">${elRoot.dataset.i18Error}</div>`;
    }else {
        if (elRoot.dataset.i18Error !== undefined){
            block_error = `<div class="help-block">${elRoot.dataset.i18Error}</div>`;
        }else {
            block_error = `<div class="help-block"></div>`;
        }
    }

    return `
        ${select_type}
        <div class="select__dropdown ${(items.length === 0) ? '_empty' : ''}">
            <ul class="select__options">${items.join('')}</ul>
        </div>
        ${block_error}
    `;
};


document.addEventListener('click', (e) => {
    if (!e.target.closest('.select')) {
        document.querySelectorAll(SELECTOR_ACTIVE).forEach(select => {
            select.classList.remove(CLASS_NAME_ACTIVE);
        });
    }
});

let inputs = document.querySelectorAll('.select.required .select__input');

function selectHandlerBlur(input){
    console.log(input);
    if (input.closest('button')){
        setTimeout(() => {
            validCustomSelect();
        }, 200)
    }else {
        validCustomSelect();
    }

    function validCustomSelect(){
        if (input.closest('.required')){
            let select = input.closest('.select');
            let select_list = select.querySelector('.select__options .select__option.select__option_selected');

            if (select_list !== null){
                select.classList.remove('has-error');
            }else {
                select.classList.add('has-error');
            }
        }
    }
}
