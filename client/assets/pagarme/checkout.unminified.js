! function() {
    function t(t) {
        t.readyState ? t.onreadystatechange = function() {
            "complete" != this.readyState && "loaded" != this.readyState || n()
        } : t.onload = n
    }

    function e(e) {
        var n = document.createElement("script");
        n.setAttribute("type", "text/javascript"), n.setAttribute("src", e), t(n), (document.getElementsByTagName("head")[0] || document.documentElement).appendChild(n)
    }

    function n() {
        c += 1, c == i && o(window.jQuery.noConflict(!0))
    }

    function o(t) {
        easyXDM && (PagarMeCheckout.easyXDM = easyXDM.noConflict("PagarMeCheckout")), t.isReady ? a(t) : t(document).ready(a)
    }

    function a(t) {
        function e(e) {
            l.container.find("iframe").css({
                top: t(document).scrollTop(),
                height: c()
            })
        }

        function n(e) {
            function a() {
                return !!t("#pagarme-checkout-container > iframe").length
            }
            return e && e.encryption_key ? (this.params = e, this.view = o, this.id = n.scriptsCount_++, n.scripts[this.id] = this, void(n.bridge && a() || (n.bridge = o.create()))) : (alert("Encryption key missing."), null)
        }
        var o, a = (window.navigator.userAgent, function() {
                return /(iPad|iPhone).*(Safari\/|Mobile\/)/gi.test(navigator.userAgent)
            }),
            i = function(t, e, n) {
                var o;
                return function() {
                    var a = this,
                        r = arguments,
                        i = function() {
                            o = null, n || t.apply(a, r)
                        },
                        c = n && !o;
                    clearTimeout(o), o = setTimeout(i, e), c && t.apply(a, r)
                }
            },
            c = function() {
                var t = 0,
                    e = 0;
                return document.documentElement && "number" == typeof document.documentElement.clientHeight && (t = document.documentElement.clientHeight), "number" == typeof window.innerHeight && (e = window.innerHeight), Math.max(t, e)
            },
            s = function(t, e) {
                var o = n.scripts[t];
                o.success(e)
            },
            u = function(t, e) {
                var o = n.scripts[t];
                o.error(e)
            },
            d = function(t) {
                var e = n.scripts[t];
                e.close()
            },
            l = {
                remotePath: "/modal.html",
                props: {
                    style: {
                        zIndex: 9999,
                        background: "transparent",
                        border: "0 none transparent",
                        overflowX: "hidden",
                        overflowY: "auto",
                        margin: 0,
                        padding: 0,
                        "-webkit-tap-highlight-color": "transparent",
                        "-webkit-touch-callout": "none",
                        position: "fixed",
                        left: 0,
                        top: 0,
                        width: "100%",
                        height: "100%"
                    }
                },
                closeModal: function(e, n) {
                    return t(document).off("scroll.pgm-checkout"), l.container.hide(), l.container.find("iframe").blur(), !0
                },
                openModal: function() {
                    l.container.show(), l.container.find("iframe").focus()
                },
                beforeOpen: function(n) {
                    a() && (l.container.find("iframe").css({
                        position: "absolute",
                        height: c(),
                        top: t(document).scrollTop()
                    }), t(document).on("scroll.pgm-checkout", i(e, 300))), n && n()
                },
                create: function() {
                    var e = t('<div id="pagarme-checkout-container"></div>').hide();
                    return t("body").append(e), l.container = e, new PagarMeCheckout.easyXDM.Rpc({
                        remote: r + l.remotePath,
                        container: e.get(0),
                        props: l.props
                    }, {
                        local: {
                            closeModal: l.closeModal,
                            submitForm: function(t, e) {
                                l.closeModal(), s(t, e)
                            },
                            error: function(t, e) {
                                u(t, e)
                            },
                            close: function(t) {
                                d(t)
                            }
                        },
                        remote: {
                            config: {},
                            animateIn: {}
                        }
                    })
                }
            };
        o = l, n.scriptsCount_ = 0, n.scripts = {}, n.prototype.mapIframeParameters_ = function(t) {
            var e = {
                card_brands: "brands"
            };
            for (var n in e) t[n] && (t[e[n]] = t[n], delete t[n])
        }, n.prototype.open = function(t) {
            var e = n.bridge,
                o = this,
                a = t;
            for (var r in this.params) a[r] = this.params[r];
            this.mapIframeParameters_(a), a.script_id = this.id, this.view.beforeOpen(function() {
                e.config(a, function() {
                    o.view.openModal(), e.animateIn()
                })
            })
        }, n.prototype.close = function(t) {
            this.params.close && this.params.close.call(this, t)
        }, n.prototype.closeModal = function() {
            this.view.closeModal()
        }, n.prototype.success = function(t) {
            this.params.success && this.params.success.call(this, t)
        }, n.prototype.error = function(t) {
            this.params.error && this.params.error.call(this, t)
        }, window.PagarMeCheckout.Checkout = n;
        for (var m = function() {
                var e = t(this).data("checkout"),
                    n = f(t("[data-checkout-id=" + t(this).data("script") + "]"));
                e.open(n)
            }, p = function() {
                for (var e = t("script"), n = [], o = 0; o < e.length; o++) e[o].src.indexOf(r + "checkout.js") == -1 && e[o].src.indexOf("https://pagar.me/assets/checkout/checkout.js") == -1 || n.push(t(e[o]));
                return n
            }, h = function(t) {
                var e = t;
                try {
                    e = decodeURIComponent(escape(t))
                } catch (n) {}
                return e
            }, f = function(t) {
                for (var e = ["create-token", "customer-data", "payment-methods", "brands", "card-brands", "header-text", "payment-button-text", "amount", "postback-url", "default-installment", "show-installment", "max-installments", "encryption-key", "ui-color", "interest-rate", "customer-name", "customer-document-number", "customer-email", "customer-address-street", "customer-address-street-number", "customer-address-complementary", "customer-address-neighborhood", "customer-address-city", "customer-address-state", "customer-address-zipcode", "customer-phone-ddd", "customer-phone-number", "free-installments", "metadata-discount-amount", "metadata-gross-amount", "boleto-discount-percentage", "boleto-discount-amount", "boleto-installment", "boleto-max-installments", "tracking", "boleto-expiration-date", "boleto-first-installment-amount", "disable-zero-document-number", "boleto-helper-text", "credit-card-helper-text", "credit-card-discount-amount", "credit-card-discount-percentage"], n = {}, o = 0; o < e.length; o++) void 0 !== t.attr("data-" + e[o]) && (n[e[o].replace(/-/g, "_")] = h(t.attr("data-" + e[o])));
                return n
            }, g = function(e) {
                e = e || "Pagar";
                var n = t('<input class="pagarme-checkout-btn" type="button" value="' + h(e) + '" />');
                return n.click(m), n
            }, y = p(), v = 0; v < y.length; v++) {
            var b = y[v],
                w = b.parents("form");
            if (w && w.length && b.data("amount") && b.data("encryption-key")) {
                var k = g(b.data("button-text"));
                k.insertBefore(b), b.data("button-class") && k.addClass(b.data("button-class"));
                var M, x = new n({
                    encryption_key: b.data("encryption-key"),
                    success: function(e) {
                        var n = t("[data-checkout-id=" + this.id + "]"),
                            o = n.parents("form"),
                            a = null,
                            r = function(e, n) {
                                n = n, t.each(e, function(e) {
                                    var a;
                                    if (a = n ? n + "[" + e + "]" : e, t.isPlainObject(this)) r(this, a);
                                    else {
                                        var i = t("<input />", {
                                            name: a,
                                            type: "hidden",
                                            val: this
                                        });
                                        o.append(i)
                                    }
                                })
                            };
                        e.token || (a = "pagarme"), r(e, a), o.submit()
                    }
                });
                M = x.id, b.attr("data-checkout-id", M), k.data("script", M), k.data("checkout", x)
            }
        }
    }
    var r = "https://assets.pagar.me/checkout/1.1.0/";
    ! function(t) {
        var e, n, o = [],
            a = {},
            r = 0,
            i = function(t) {
                return Array.prototype.slice.call(t)
            },
            c = function() {
                u(JSON.stringify({
                    method: "_pending"
                }))
            },
            s = function() {
                for (var t in a)
                    if (!a[t].responded) return void u(a[t].message)
            },
            u = function(t) {
                e.postMessage(t, n)
            },
            d = function() {
                var t, e = i(arguments),
                    n = e.shift();
                t = e.length && "function" == typeof e[e.length - 1] ? e.pop() : function() {}, r += 1;
                var o = JSON.stringify({
                    method: n,
                    args: e,
                    id: r
                });
                a[r] = {
                    message: o,
                    cb: t
                }, u(o)
            };
        t.createTransport = function(t, r) {
            return n = r || "*", setInterval(function() {
                e && c()
            }, 300), window.addEventListener("message", function(e) {
                var n = document.createElement("a"),
                    i = document.createElement("a");
                if (n.href = r, i.href = e.origin, !r || n.hostname === i.hostname) {
                    var c = e.source,
                        u = e.origin,
                        d = JSON.parse(e.data);
                    if ("_ack" == d.method) a[d.id] && (a[d.id].cb(), delete a[d.id]);
                    else if ("_pending" == d.method) s();
                    else {
                        if (o.indexOf(d.id) != -1) return;
                        o.push(d.id), c.postMessage(JSON.stringify({
                            method: "_ack",
                            id: d.id
                        }), u), t[d.method] && t[d.method].apply(null, d.args)
                    }
                }
            }), {
                callMethod: function() {
                    d.apply(null, arguments)
                },
                setSource: function(t) {
                    e = t
                },
                restart: function() {
                    o = []
                }
            }
        }
    }(window);
    var i = 1,
        c = 0;
    window.PagarMeCheckout = window.PagarMeCheckout || {}, window.PagarMeCheckoutLoadedRetail || (window.PagarMeCheckoutLoadedRetail = !0, void 0 !== window.jQuery && "1.10.1" === window.jQuery.version || (i += 1, e("//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js")), "object" != typeof window.JSON && (i += 1, e(r + "/json.min.js")), e(r + "/easyXDM.js"))
}();