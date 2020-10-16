import { runInThisContext } from "vm";

("use strict");

export default class ModalPreCheckoutController {
  submitted = false;
  options = [
    {
      Description:
        "Exibir meu nome e o valor da contribuição na galeria de apoiadores.",
      ShowName: true,
      ShowAmount: true,
    },
    {
      Description: "Não exibir meu nome na galeria de apoiadores.",
      ShowName: false,
      ShowAmount: true,
    },
    {
      Description:
        "Não exibir o valor da contribuição na galeria de apoiadores.",
      ShowName: true,
      ShowAmount: false,
    },
    {
      Description:
        "Não exibir meu nome e o valor da contribuição na galeria de apoiadores.",
      ShowName: false,
      ShowAmount: false,
    },
  ];
  selectedOption = 0;
  url = "";
  data = {};
  result = null;
  donation = {};
  openInter = false;
  user = {};
  countryList = [];
  selectedOption = {};
  
  //Object with id from pagarme and paypal
  subsEq = {
    597877: "P-6SY59256EY8348214L56PZLA", //Nível Básico
    365652: "P-99760038E0332113BL56PKAQ", //Nível I
    365655: "P-36P02040VK1637633L56PKZY", //Nível II
    365656: "P-2W998751YX760815XL56PLPQ", //Nível III
    365657: "P-78H357725X520833SL56PL5Q", //Nível IV
    365658: "P-6YH230506D982832NL56PMOQ", //Nível V
    365659: "P-26P595292B305144TL56PXKY", //Nível VI
    365661: "P-8EP50018W6024912DL56PXWY", //Nível VII
    365662: "P-9FU872901S362025WL56PYDY", //Nível VIII
    365663: "P-3D420037TY135114GL56PYMQ", //Nível IX
    365665: "P-9RG848987Y230054DL56PYVI"  //Nível X
  }

  /*@ngInject*/
  constructor(
    Modal,
    Donation,
    $http,
    $interval,
    $state,
    Checkout,
    Util,
    $scope
  ) {
    this.Modal = Modal;
    this.Donation = Donation;
    this.$http = $http;
    this.$interval = $interval;
    this.$state = $state;
    this.Checkout = Checkout;
    this.Util = Util;
    this.$scope = $scope;
    
      
  }

  $onInit() {
    this.countryList = this.Util.getCountryList();

    if (this.resolve.donation) {
      this.donation = this.resolve.donation;
    }

    if (this.resolve.option) {
      this.selectedOption = this.resolve.option;
    }
  }

  brasilCheckout() {
    this.openCheckout("true", null, null);
  }

  worldCheckout() {
    this.openInter = true;
    this.intervalId = setInterval(() => {
      const elementExists = !!document.getElementById('paypal-button-container');
      if (elementExists) {
        clearTimeout(this.intervalId);

        if(document.getElementById("paypal-script")){
          document.getElementById("paypal-script").remove();
        }
        this.paypalRenderer();
      }
    }, 1000);
  }

  openCheckout(isNational, entryCustomer, entryBilling) {
    var loading = this.Modal.showLoading();
    console.log(this.selectedOption)
    let options = {
      amount: this.donation.ValueInCents,
      buttonText: "Pagar",
      headerText:
        this.donation.Frequency === "monthly"
          ? "Contribuição mensal {price_info}"
          : "Valor da contribuição {price_info}",
      customerData: isNational,
      createToken: "false",
      paymentMethods:
        (this.donation.Frequency === "monthly" && this.selectedOption.planId != 1080699)
          ? "credit_card"
          : "credit_card,boleto",
    };

    if (entryCustomer) {
      options["customer"] = entryCustomer;
    }

    if (entryBilling) {
      options["billing"] = entryBilling;
    }

    this.Checkout.open(
      options,
      (data) => {
        if (!isNational) {
          data = Object.assign({}, data, options);
        }
        var url;
        if (this.donation.Frequency === "monthly") {
          url = "/api/subscriptions";
          data.plan_id = this.selectedOption.planId;
        } else if (this.donation.Frequency === "once") {
          url = "/api/transactions";
        }

        this.Modal.openCheckout(url, {
          payment: data,
          donation: this.donation,
        })
          .then(() => {
            this.close();
            loading.close();
          })
          .catch((err) => {
            console.log(err);
            this.close();
            loading.close();
          });
      },
      (err) => {
        console.log(err);
        this.close();
        loading.close();
      },
      () => {
        console.log("The modal has been closed.");
        this.close();
        loading.close();
      }
    );
  }

  ok(value) {
    this.close({ $value: value });
  }

  cancelModal() {
    this.dismiss({ $value: "cancel" });
  }

  submitInternational(form) {
    this.submitted = true;

    if (form.$valid) {
      let customer = {
        name: this.user.name,
        type: "individual",
        country: this.user.country.toLowerCase(),
        email: this.user.email,
        document_number: this.user.passport,
        phone: this.user.phone,
        documents: [
          {
            type: "passport",
            number: this.user.passport,
          },
        ],
        phone_numbers: [this.user.phone],
        address: {
          country: this.user.country.toLowerCase(),
          state: this.user.state,
          city: this.user.city,
          //neighborhood: this.user.neighborhood,
          street: this.user.street,
          street_number: this.user.number,
          zipcode: this.user.zipcode,
          complementary: this.user.complementary,
        },
      };

      let billing = {
        name: this.user.name,
        address: {
          country: this.user.country.toLowerCase(),
          state: this.user.state,
          city: this.user.city,
          //neighborhood: this.user.neighborhood,
          street: this.user.street,
          street_number: this.user.number,
          zipcode: this.user.zipcode,
          complementary: this.user.complementary,
        },
      };

      this.openCheckout(false, customer, billing);
    }
  }

  paypalRenderer() {
    var self = this;
    
    //Needs to wait for paypal sdk
    setTimeout(()=>{
      //Close loading
      document.getElementById('paypal-loading').style.display = "none";

      if(this.donation.Frequency == "once"){
        paypal
        .Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical', 
          },
  
          // Set up the transaction
          createOrder: function (data, actions) {
            return actions.order.create({
              purchase_units: [
                {
                  amount: {
                    currency_code: "BRL",
                    value: self.donation.ValueInCents/100,
                    //value: 1.00,
                  },
                },
              ],
            });
          },
  
          // Finalize the transaction
          onApprove: function (data, actions) {
            console.log("Approved", Date.now());
            
            document.getElementById('paypal-loading').style.display = "flex";
            document.getElementById('paypal-loading').style.paddingTop = "16px";
            document.getElementById('paypal-button-container').style.display = "none";

            return actions.order.capture().then(function (details) {
              // Show a success message to the buyer
              console.log("Captured", Date.now());
              self.Modal.showAlert('Obrigado por sua contribuição', 'Seu pagamento foi confirmado e está fortalecendo a comunidade IMEana.');
              self.close();
            });
          },
  
          // Error handling
          onError: function (err) {
            // Show an error page here, when an error occurs
            self.Modal.showAlert('Ocorreu um erro', err);
            console.log(err);
          }
        })
        .render("#paypal-button-container");
      }else{
        paypal
        .Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe',
          },
          // Set up the subscription
          createSubscription: function(data, actions) {
            return actions.subscription.create({
              'plan_id': self.subsEq[self.selectedOption.planId]
              //'plan_id': 'P-7MJ753126U710730EL43PUFI'
            });
          },
  
          // Finalize the transaction
          onApprove: function(data, actions) {
            // Show a success message to the buyer
            self.close();
            self.Modal.showAlert('Obrigado por sua contribuição', 'Seu pagamento foi confirmado e está fortalecendo a comunidade IMEana.');
          },
  
          // Error handling
          onError: function (err) {
            // Show an error page here, when an error occurs
            self.Modal.showAlert('Ocorreu um erro', err);
            console.log(err);
          }
        })
        .render("#paypal-button-container");
      }
    },500)
    
  }
}
