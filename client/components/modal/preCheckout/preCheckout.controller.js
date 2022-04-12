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
  url = "";
  data = {};
  result = null;
  donation = {};
  openInter = false;
  user = {};
  countryList = [];
  selectedOption = {};
  selectedMethod = 'credit_card';

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

    //Function to lazy load script
    $scope.makeScript = function (url) {
      var script = document.createElement('script');
      script.setAttribute('src', url);
      script.setAttribute('type', 'text/javascript');
      document.getElementById('paymentDiv').appendChild(script);
    };
  }

  $onInit() {
    this.countryList = this.Util.getCountryList();

    if (this.resolve.donation) {
      this.donation = this.resolve.donation;
    }

    if (this.resolve.option) {
      this.selectedOption = this.resolve.option;
    }

    if (this.resolve.method) {
      this.selectedMethod = this.resolve.method;
    }

    this.$http.get('/environment/paypal')
      .then(response => {
        this.$scope.makeScript(response.data[this.donation.Frequency]);
      }).catch(err=>{
        this.Modal.showAlert('Ocorreu um erro', err.data);
        this.close();
      });
    
    this.$http.get('/environment/pagarme')
      .then(response => {
        this.pagarmeKey = response.data.encryptionKey;
        if (this.selectedMethod === 'boleto' || this.selectedMethod === 'pix') {
          this.brasilCheckout();
        }
      }).catch(err=>{
        this.Modal.showAlert('Ocorreu um erro', err.data);
        this.close();
      });
      
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
        (this.donation.Frequency === "monthly" && this.selectedMethod === "credit_card" && this.selectedOption.planId != 1080699)
          ? "credit_card"
          : this.selectedMethod,
    };
    if (entryCustomer) {
      options["customer"] = entryCustomer;
    }

    if (entryBilling) {
      options["billing"] = entryBilling;
    }

    this.Checkout.open(
      options,
      this.pagarmeKey,
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
              'plan_id': self.selectedOption.paypalId
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
