import Typed from "typed.js";

class SearchForm extends HTMLElement{
    constructor(){
        super();
        this.configs = JSON.parse(this.querySelector('script[type="applicationId/json"][data-id="searh-configs"]')?.innerHTML || '{}');
        
        this.searchInput = this.querySelector('input[name="search"]');
        if(this.configs.search_animation_text.length > 0 && this.configs.search_animation){
            this.initSearchTypedAnimation.call(this);
        }

    }
    initSearchTypedAnimation(){
        this.typedAnimation = new Typed(this.searchInput,{
            strings: this.configs.search_animation_text.map(el => el.text),
            loop: true,
            smartBackspace: true,
            typeSpeed: 50,
            backSpeed: 10,
            bindInputFocusEvents: true,
            backDelay: 600,
        })
        console.log('initilised typing effect')
    }   

};
customElements.define('search-form',SearchForm);