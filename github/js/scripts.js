Array.prototype.forEach || (Array.prototype.forEach = function(c, a) {
  for (var d = 0, e = this.length; d < e; ++d) {
    c.call(a, this[d], d, this);
  }
});

String.prototype.capitalize = function() {
  var c = /^(a|e|o|da|de|do|br|n\u00e3o|das|dos|ao|ou|em|oz|um|uma|seu|com|a|an|and|as|os|at|but|by|en|for|if|in|of|on|or|the|to|vs?\.?|via)$/i;
  return this.toLowerCase().replace(/([^\W_]+[^\s-]*) */g, function(a, d, e, f) {
    return 0 < e && e + d.length !== f.length && -1 < d.search(c) && ":" !== f.charAt(e - 2) && 0 > f.charAt(e - 1).search(/[^\s-]/) ? a.toLowerCase() : -1 < d.substr(1).search(/[A-Z]|\../) ? a : a.charAt(0).toUpperCase() + a.substr(1);
  });
};

function isArray(obj) {
    return Array.isArray(obj);
}

$(function() {
	(function() {

		/**
			* Main application class, responsible for all main funcionalities and call anothers classes constructors
			* @exports VendaPersonalizada
			* @constructor
		*/

		var vendapersonalizada = {
			usr: "",
            vpCode: "new",
            vpData: [],
            icons: [
                {"id":0,"classname":"fa-check waiting","name":"Pendente"},
                {"id":1,"classname":"fa-check success","name":"Aprovada"},
                {"id":2,"classname":"fa-check warning","name":"Aprovada com Restricao"},
                {"id":3,"classname":"fa-times error","name":"Reprovada"},
                {"id":4,"classname":"fa-check aware","name":"Ciente/Avaliada"}
            ],

		    /**
			    * Login control, set user profile and load website menu
			    * @memberOf VendaPersonalizada#
		    */

	        init: function() {
	        	vendapersonalizada.vpData = [];
	        	var denied = true;

	        	if (!$.cookie("portal"))
                    window.location.href = './login.html';
                this.usr=jQuery.parseJSON($.cookie("portal"));

                if (!this.usr.VendaPersonalizada) {
                    window.location.href = './login.html';
                } else {
                	var perfil = new Perfil();
                	perfil.getPerfil(this.usr.VendaPersonalizada);
                }

                this.menu();
                this.toTop('.toTop');
                $('div.loader').fadeOut('fast');
                $(".repre_name").text(this.usr.Nome);
                vendapersonalizada.loader(1);
                vendapersonalizada.load('inicial');
	        },

		    /**
			    * Website menu control (Mobile and Desktop)
			    * @memberOf VendaPersonalizada#
		    */

	        menu: function() {

	        	//Mobile
	        	$('main nav > ul > li.m_menu a').click(function() {
	        		$(this).parent().toggleClass('active');
	        		$(this).find('i').toggleClass('fa-bars').toggleClass('fa-times');
	        		$(this).closest('ul').find('>li').not('.m_menu').toggleClass('f_menu');
	        	});

	        	//First Level
	        	$('main nav > ul > li').not(".disabled").not(".m_menu").not(".manual").find(' > a').click(function() {
	        		$('main nav > ul li').not(".m_menu").removeClass('active');
	        		$(this).parent().toggleClass('active');
	        		if (
	        			$(this).attr('data-url') !== undefined && 
	        			$(this).attr('data-url') !== null &&
	        			$(this).next('ul').hasClass('disabled')
	        		) {
		        		vendapersonalizada.loader(1);
		        		vendapersonalizada.load($(this).attr('data-url'));
	        		}
	        		if ($(this).attr('name') !== 'solicitacao') {
	        			$('main nav > ul > li.m_menu a').click();
	        		}
	        	});

	        	//Second Level
	        	$('main nav > ul > li > ul > li > a').click(function() {
	        		if ($(this).parent().hasClass("active")) {
                        return !1;
                    }
	        		vendapersonalizada.loader(1);
                    hasher.setHash($(this).attr('data-url') + "/" + vendapersonalizada.vpCode);
                    if (vendapersonalizada.wSize() < 990) { $('main nav > ul > li.m_menu a').click(); }
                    $('.m_menu').toggleClass('active');
	        	});

	        	vendapersonalizada._menuHeight();
	        	vendapersonalizada.logoutButton();

				$('body a').click(function() {
	        		vendapersonalizada._menuHeight();
	        	});

	        	$(window).resize(function() {
	        		vendapersonalizada.logoutButton();
	        		$('main nav > ul li.m_menu a i').removeClass('fa-times').addClass('fa-bars');
					$('main nav > ul li').removeAttr('style');
					vendapersonalizada._menuHeight();
				});

				$('.logout').click(function() {
					$.removeCookie('portal', {
						path: '/'
					});
				});
	        },

		    /**
			    * Table resize in `Fluxo de Aprovação` and `Validação de Proposta pelo Cliente`
			    * @memberOf VendaPersonalizada#
		    */

			_menuHeight: function() {
				var _h = $('main nav > ul > li.active > ul').height();

				switch(_h) {
		    		case 0:
					$('main .vpResume, main > section > form').removeClass('twoRows').addClass('noRows');
		    		break;
		    		case 40:
					$('main .vpResume, main > section > form').removeClass('noRows').removeClass('twoRows');
		    		break;
		    		case 80:
					$('main .vpResume, main > section > form').removeClass('noRows').addClass('twoRows');
		    		break;
				}
        	},

		    /**
			    * Button for scroll to top
			    * @memberOf VendaPersonalizada#
		    */

	        toTop: function(elem) {
		        var offset = 220;
		        var duration = 500;

		        jQuery(window).scroll(function() {
		          if (jQuery(this).scrollTop() > offset) {
		            jQuery(elem).fadeIn(duration);
		          } else {
		            jQuery(elem).fadeOut(duration);
		          }
		        });
		        
		        jQuery(elem).click(function(event) {
		          event.preventDefault();
		          jQuery('html, body').animate({scrollTop: 0}, duration);
		          return false;
		        });
	        },

		    /**
			    * Function for load pages
			    * @param {String} page Page that will load
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        load: function(page,code) {
	        	var self = this;

	        	$.ajax({
        			url: "pages/" + page + ".html",
	        		beforeSend: function() {
						$('body main section').html('');
	        		},
	        		success: function(result) {
			        	$('body main section').hide().html(result);
				    },
				    complete: function() { 
				    	vendapersonalizada.loader(0); 
				    	var perfil=self.usr.Perfil.DescPerfil;
				    	switch(page) {
				    		case 'inicial':
                            vendapersonalizada.inicial(); 
                            break;
                            case 'solicitacao/dados':
                            vendapersonalizada.dados(code); 
                            break;
                            case 'solicitacao/segmentacao':
                            vendapersonalizada.segmentacao(code); 
                            break;
                            case 'solicitacao/base':
                            vendapersonalizada.base(code); 
                            break;
                            case 'solicitacao/amostra':
                            vendapersonalizada.amostra(code); 
                            break;
                            case 'solicitacao/finalidade_produto':
                            vendapersonalizada.finalidadeProduto(code); 
                            break;
                            case 'solicitacao/prazo_preco_quantidade':
                            vendapersonalizada.prazoPrecoQuantidade(code); 
                            break;                          
                            case 'solicitacao/similaridade':
                            vendapersonalizada.similaridade(code); 
                            break;
                            case 'fluxo/inicial':
                            vendapersonalizada.fluxo_inicial(); 
                            break;
                            case 'fluxo/resumo':
                            vendapersonalizada.fluxo_resumo(code); 
                            break;
                            case 'fluxo/comercial_g':
	                            if (perfil !== "Gerente Comercial" && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
	                            vendapersonalizada.comercial_g(code); 
                            break;
                            case 'fluxo/comercial_d':
                            	if (perfil !== "Diretor Comercial"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
                            	vendapersonalizada.comercial_d(code); 
                            break;
                            case 'fluxo/produto':
                            	if (perfil !== "Gerente de Produto - Projetos Especiais"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
                            	vendapersonalizada.produto(code); 
                            break;
                            case 'fluxo/supply_chain':
                            	if (perfil !== "Gerente de Supply Chain"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
                            	vendapersonalizada.supply_chain(code); 
                            break;
                            case 'fluxo/financeiro_cus':
                            	if (perfil !== "Gerente Financeiro/Custos"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }

	                            if(perfil !== "Gerente Financeiro/Custos"  && perfil !== "Superintendente" && perfil !== "Administrator"){
                            		$(".productCategories").addClass("hide");
                            	}
                            	else{
                            		$(".productCategories").removeClass("hide");
                            	}
                            	vendapersonalizada.financeiro_cus(code); 
                            break;
                            case 'fluxo/financeiro_cre':
                            	if (perfil !== "Gerente Financeiro/Crédito"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
                            	vendapersonalizada.financeiro_cre(code); 
                            break;
                            case 'fluxo/importacao':
                            	if (perfil !== "Gerente Importação/Negociação"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
                            	vendapersonalizada.importacao(code);
                            break;
                            case 'fluxo/superintendencia':
                            	if (perfil !== "Superintendente"  && perfil !== "Administrator") {
	                            	$(".save_button").addClass("hide");
	                            } else {
	                            	$(".save_button").removeClass("hide");
	                            }
                            	vendapersonalizada.superintendencia(code); 
                            break;
                            case 'validacao/inicial':
                            vendapersonalizada.validacao_inicial(); 
                            break;
                            case 'validacao/resumo':
                            vendapersonalizada.validacao_resumo(code); 
                            break;                            
                            case 'validacao_rep/inicial':
                            vendapersonalizada.validacao_rep(code); 
                            break;
                            case 'validacao/rep':
                            vendapersonalizada.validacao_result(code); 
                            break;
				    	}
						vendapersonalizada._menuHeight();
					}
				});
	        },

		    /**
			    * Show and hide the loader of application
			    * @memberOf VendaPersonalizada#
		    */

	        loader: function(l) {
	        	vendapersonalizada.ie8();

	        	if (l) {
		        	$('div.loader').fadeIn('fast');
		        } else {
		        	$('div.loader').fadeOut('fast',function() {
		        		$('body main section').show();
		        	});
		        }
	        },

		    /**
			    * Show and hide navigation buttons
			    * @memberOf VendaPersonalizada#
		    */

	        navButtons: function(st) {
	        	var btns = $('form fieldset a.btn.next, form fieldset a.btn.prev');

	        	if (st) {
	        		btns.fadeIn('fast');
	        	} else {
	        		btns.hide();
	        	}
	        },

		    /**
			    * Advance to next page
			    * @memberOf VendaPersonalizada#
		    */

	        navPage: function() {
                $('main nav > ul > li > ul > li.active').next().find("a").trigger("click");
                $('.m_menu a').click();
                $('.m_menu').toggleClass('active');
            },

		    /**
			    * Return to previous page
			    * @memberOf VendaPersonalizada#
		    */

            navPagePrev: function() {
                $('main nav > ul > li > ul > li.active').prev().find("a").trigger("click");
                $('.m_menu a').click();
                $('.m_menu').toggleClass('active');
            },

		    /**
			    * Counter of filled tabs in `Solicitação de Venda`
			    * @memberOf VendaPersonalizada#
		    */
		   
            setCounter: function() {
                var count = 0;

                vendapersonalizada.vpData.forEach(function(el, index) {
                    if ((isArray(el) && el.length) || (!isArray(el) && el !== null)) {
                    	$('main nav > ul > li > ul > li > a').eq(index).addClass("checked-tab");

                        count++; 

                        if (count) {
                            $('main nav > ul > li').not(".disabled").not(".m_menu").eq(0).find("em").text(count).removeClass("hide");
                        } else {
                            $('main nav > ul > li').not(".disabled").not(".m_menu").eq(0).find("em").text(count).addClass("hide");
                        }                                              
                    }
                });
            },

		    /**
			    * Get the window size
			    * @memberOf VendaPersonalizada#
		    */

	        wSize: function() {
	        	return $(window).width();
	        },

	        ie8: function() {
	        	if ($("html").hasClass("ie8")) { 
	        		$('.radio label, .checkbox label').prepend('<span class="before"></span>').click(function() {
	        			if ($(this).prev('input').attr('disabled')) {return;}

	        			if ($(this).parent().hasClass('radio')) {
	        				var _i_name = $(this).prev('input').attr('name');
	        				$('input[name=' + _i_name + ']').prop('checked', false).next('label').removeClass('checked');
	        			}

	        			$(this).toggleClass('checked');
	        		});

	        		$('div.table_min dl dt, div.table_min dl dd').prepend('<span class="before"></span>');

	        		/* Looping */
	        		$('input').each(function() {
	        			if ($(this).attr('checked')) {
	        				$(this).next('label').addClass('checked');
	        			}
	        		});
	        	}
	        },

		    /**
			    * Return the VP status (ANDAMENTO, REVENDO, etc...)
			    * * Used webservices: VpList
			    * @param {function} callback Return the VP status
			    * @memberOf VendaPersonalizada#
		    */
		   
	        getStatus: function(callback) {
	        	var result;
	        	var self = this;
	            var VPLIST = {
	                Aprovacao: '',
	                Cliente: '',
	                CodCliente: '',
	                CodRepre: '',
	                Data: '',
	                Gestor: '',
	                Representante: '',
	                Status: '',
	                VPNumber: self.vpCode,
	                Departamento:self.usr.Perfil.DescPerfil,
	                Filtro:self.usr.VKBUR,
	                VPCode:self.vpCode,
	                VPNumberBase: ''
	            };

	            $.ajax({
	                url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
	                data: JSON.stringify(VPLIST),
	                type: 'POST',
	                contentType: "application/json; charset=utf-8",
	                traditional: true,
	                success: function(data) {
	                	if (data.length > 3) {
		                	result = JSON.parse(data)[0].Status;
		                	if (typeof callback === "function") callback(result);
	                	} else {
		                	result = 'ANDAMENTO';
		                	if (typeof callback === "function") callback(result);
	                	}
	                },
	            });
	        },

		    /**
			    * Finish the VP solicitation, returning a modal with Success or Error
			    * * Used webservices: FinalizaVP
			    * @memberOf VendaPersonalizada#
		    */

	        finalizaVp: function() {
				$.get('http://was-dev/Focus24/Services/VP.svc/FinalizaVP/' + vendapersonalizada.vpData[0].VPNumber, function(a) {
					var modal = new Modal();
					var n = $('.repre_name').text().split('Nº ')[1];
					vendapersonalizada.vpData[0].VPNumber = '';
					modal.open('VP ' + n + ' Aguardando aprovação!', 'Feche esta janela.', !1, vendapersonalizada.goHome);
                }).fail(function() {
                    var modal = new Modal();
					modal.open('Um erro Ocorreu!', 'Contate o administrador do sistema.', !0, !1);
                });
	        },

		    /**
			    * Remove the buttons `Salvar Dados` and `Enviar Solicitação de VP` in Solicitação de Venda Personalizada if the VP doesn't have the status `ANDAMENTO` or `REVENDO`
			    * * Used webservices: VpList, 
			    * @memberOf VendaPersonalizada#
		    */

	        vpFinalizada: function() {
	        	var self = this;
                var VPLIST = {
                    Aprovacao: '',
                    Cliente: '',
                    CodCliente: '',
                    CodRepre: '',
                    Data: '',
                    Gestor: '',
                    Representante: '',
                    Status: '',
                    VPNumber: self.vpCode,
                    Departamento:self.usr.Perfil.DescPerfil,
                    Filtro:self.usr.VKBUR,
                    VPCode:self.vpCode,
                    VPNumberBase: self.vpCode
                };

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var status = JSON.parse(data)[0].Status;
                        if (status !== "ANDAMENTO" && status !== "REVENDO") {
                        	$('a.btn.next, a.btn.finish').remove();
                        }
                    },
                });
	        },

		    /**
			    * Redirect to homepage
			    * @memberOf VendaPersonalizada#
		    */

	        goHome: function() {
	        	window.location.href = "";
	        },

		    /**
			    * Redirect to `#/solicitacao/base/`
			    * @memberOf VendaPersonalizada#
		    */

	        goBase: function() {
	        	window.location.href = "#/solicitacao/base/" + vendapersonalizada.vpCode;
	        },

		    /**
			    * Control the logout button for desktop and mobile
			    * @memberOf VendaPersonalizada#
		    */

        	logoutButton: function() {
        		if ($(window).width() > 990) {
        			$('a.logout').eq(1).addClass('hide');
        			$('a.logout').eq(0).removeClass('hide');
        		} else {
        			$('a.logout').eq(0).addClass('hide');
        			$('a.logout').eq(1).removeClass('hide');
        		}
        	},

		    /**
			    * Redirect to `#/fluxo/resumo/`
			    * @memberOf VendaPersonalizada#
		    */

	        redirectWorkFlow: function() {
	        	window.location.href = "#/fluxo/resumo/" + vendapersonalizada.vpCode;
	        },

		    /**
			    * Reload the current page
			    * @memberOf VendaPersonalizada#
		    */

	        redirectProposta: function() {
	        	window.location.reload();
	        },

		    /**
			    * Load the homepage content
			    * * Used webservices: custumerAll, VPPendente, PropostaList
			    * @memberOf VendaPersonalizada#
		    */
		   
	        inicial: function() {
	        	var self = this;
	        	vendapersonalizada.vpData = [];
				$(document).ready(function() {

					// Retorna todas as VPs pendentes para solicitação, atreladas ao código informado e apresentadas em Home > Solicitação de Venda
	        		
	        		var vpRepresentante = "http://was-dev/Focus24/Services/VP.svc/custumerAll/" + (self.usr.TIPO === "GESTOR" ? self.usr.VKBUR : self.usr.CodRepresentante);
			        $.getJSON(vpRepresentante + "?callback=?", function (dadosRetorno) {
						$.each(dadosRetorno, function (index, value) {
						    var html = '';
                            html += '<li><a href="#/solicitacao/dados/' + value.VPCode + '" vpnr="' + value.VPCode + '"><p>VP <strong>' + value.VPCode + '</strong> - ' + value.Cliente + ' - ' + value.Data + ' - ';
                            if (value.Status === "ANDAMENTO" || value.Status === "REVENDO") {
                                html += 'Pendente para o envio.</p></a></li>';
                            } else {
                                html += value.Status.capitalize() + ' Aprovação.</p></a></li>';
                            }
                            $('.vp-solicitacao').append(html);
					    });

						// Retorna todas as VPs pendentes para o Fluxo de Aprovação, atreladas ao código informado e apresentadas em Home > Fluxo de Aprovação
						
						var VPFLUXO = {
							Departamento:self.usr.Perfil.DescPerfil,
							Filtro:self.usr.VKBUR
						}

						$.ajax({
		                    url: 'http://was-dev/Focus24/Services/VP.svc/VPPendente/0',
		                    data: JSON.stringify(VPFLUXO),
		                    type: 'POST',
		                    contentType: "application/json; charset=utf-8",
		                    traditional: true,
		                    success: function(data) {
		                    	if (data) {
		                    		var retorno = JSON.parse(data);

			                        if (retorno.length) {
			                        	$("dl.FluxoAprovacaoCriar1").find(".error").removeClass("hide");
			                        	$("dl.FluxoAprovacaoCriar1").find(".success").addClass("hide");
			                        }

			                        $.each(retorno, function (index, value) {
									    var html = '';

			                            html += '<li><a href="#fluxo/resumo/' + value.VPCode + '" vpnr="' + value.VPCode + '"><p>VP <strong>' + value.VPCode + '</strong> - ' + value.Cliente + ' - ' + value.Data;
			                            $('.vp-fluxo').append(html);
								    });
		                    	}

								// Retorna todas as VPs pendentes para Elaboração de Proposta, atreladas ao código informado e apresentadas em Home > Elaboração de Proposta Focus
		                        
		                        var PROPLISTGEST = {
			                        Cliente: "",
			                        CodCliente: "",
			                        Considerada: 0,
			                        Data: "",
			                        DataEncerramento: "",
			                        DataEnvio: "",
			                        DataProposta: "",
			                        Obs: "",
			                        Resposta: "",
			                        Status:"Pendente",
                        			StatusCliente: "",
			                        VPNumber: "",
			                        GesRep:(self.usr.VKBUR || self.usr.CodRepresentante),
			                        VPCode:""
			                    }

			                    $.ajax({
			                        url: 'http://was-dev/Focus24/Services/VP.svc/PropostaList/0',
			                        data: JSON.stringify(PROPLISTGEST),
			                        type: 'POST',
			                        contentType: "application/json; charset=utf-8",
			                        traditional: true,
			                        success: function(data) {
			                        	if (data) {
			                        		retorno = JSON.parse(data);

				                            if (retorno.length) {
					                        	$("dl.PropostaVPCriar1").find(".error").removeClass("hide");
					                        	$("dl.PropostaVPCriar1").find(".success").addClass("hide");
					                        }

				                            $.each(retorno, function (index, value) {
											    var html="";
					                            html+='<li><a href="#validacao/resumo/'+value.VPCode+'" vpnr="'+value.VPCode+'"><p>VP <strong>' + value.VPCode + '</strong> - ' + value.Cliente + ' - ' + value.Data;
					                            $('.vp-proposta').append(html);
										    });
			                        	}

										// Retorna todas as VPs pendentes para Validação de Proposta, atreladas ao código informado e apresentadas em Home > Fluxo de Aprovação
			                            
			                            var PROPLISTREP = {
					                        Cliente: "",
					                        CodCliente: "",
					                        Considerada: 0,
					                        Data: "",
					                        DataEncerramento: "",
					                        DataEnvio: "",
					                        DataProposta: "",
					                        Obs: "",
					                        Resposta: "",
					                       	Status:"",
                        					StatusCliente: "",
					                        VPNumber: "",
					                        GesRep:(self.usr.CodRepresentante || self.usr.VKBUR),
					                        VPCode:""
					                    }

						                $.ajax({
						                    url: 'http://was-dev/Focus24/Services/VP.svc/PropostaList/0',
						                    data: JSON.stringify(PROPLISTREP),
						                    type: 'POST',
						                    contentType: "application/json; charset=utf-8",
						                    traditional: true,
						                    success: function(data) {
						                    	if (data) {
						                    		var retorno = JSON.parse(data);

							                        if (retorno.length) {
							                        	$("dl.ValidacaoPropostaVPCriar1").find(".error").removeClass("hide");
							                        	$("dl.ValidacaoPropostaVPCriar1").find(".success").addClass("hide");
							                        }

							                        $.each(retorno, function (index, value) {
							                        	if (!value.DataEncerramento.length) {
							                        		var html = '';

								                            html += '<li><a href="#validacao/rep/' + value.VPCode + '" vpnr="' + value.VPCode + '"><p>VP <strong>' + value.VPCode + '</strong> - ' + value.Cliente + ' - ' + value.Data;
								                            $('.vp-validacao').append(html);
							                        	}
												    });
						                    	}
						                    }
						                });
			                        },
			                    });
		                    },
		                });

						// Remove da home VPs que estão com o status "Aprovada" e "Reprovada"
                        
                        $('li').each(function() {
                        	$(this).find(' a:contains("Aprovada")').parents('li').remove();
                        	$(this).find(' a:contains("Reprovada")').parents('li').remove();
                        });

                        // Ordena VPs por ordem decrescente
						
						$('.vp-solicitacao').find('a').sort(function (a, b) {
							return $(b).attr('vpnr') - $(a).attr('vpnr');
						}).appendTo('.vp-solicitacao');
						$('.vp-solicitacao li').remove();
						$('.vp-solicitacao a').wrap('<li></li>');

						// Se o usuário não for perfil "Representante" ou "Administrador", não visualiza VPs pendentes para Validação de Proposta
						
						if (self.usr.Perfil.DescPerfil !== "Representante" && self.usr.Perfil.DescPerfil !== "Administrator") {
							$("dl.ValidacaoPropostaVPCriar1").hide();
						}

						// Toggle "Ver Tudo" em Solicitação de Venda
						
						$(".view-all-requestVp").bind("click", function() {
							var icon = $(this).find('i');
							
							$(this).toggleClass("less");
							$("main section div.inicial dl.SolicitacaoVPLer2 dd").toggleClass("minimum-requestVp");

							if ($(this).is('.less')) {
								icon.removeClass('fa-angle-double-down');
								icon.addClass('fa-angle-double-up');
							} else {
								icon.removeClass('fa-angle-double-up');
								icon.addClass('fa-angle-double-down');
							}
						});

						// Toggle "Ver Tudo" em Validação de Proposta Focus
						
						$(".view-all-validation").bind("click",function() {
							var icon = $(this).find('i');

							$(this).toggleClass("less");
							$("main section div.inicial dl.ValidacaoPropostaVPCriar1 dd").toggleClass("minimum-validation");

							if ($(this).is('.less')) {
								icon.removeClass('fa-angle-double-down');
								icon.addClass('fa-angle-double-up');
							} else {
								icon.removeClass('fa-angle-double-up');
								icon.addClass('fa-angle-double-down');
							}
						});
					});
	        	});
	        },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Identificação do Cliente`
			    * * Used webservices: custumer, Savecustumer
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        dados: function(code) {
	        	vendapersonalizada.setCounter();

	        	if (code !== "new") {
	        		var complete = true;
	        		var retorno = vendapersonalizada.vpData[0];

	        		$('p.success').removeClass('hide');
	        		$('.canDisable').attr('disabled', 'disabled');

	        		// Se não for uma nova VP, auto-completa os campos com os dados inseridos anteriormente 
					
					$.each(retorno, function(index, value) {
					    $('input[type=text]').each(function() {
					    	if ($(this).attr('id') === index) {
					    		$(this).val(value);
					    	}
					    });
					});

					// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
		            
		            $('input').not('#Marca').each(function() {
		                if (!$(this).val()) {
		                    complete = false;
		                }
		            });

		            if (complete) {
		                $('a.btn.next').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		            vendapersonalizada.vpFinalizada();
	        	}

	        	// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('input').on('input', function() {
		            var complete = true;

		            $('input').not('#Marca').each(function() {
		                if (!$(this).val()) {
		                    complete = false;
		                }
		            });

		            if (complete) {
		                $('a.btn.next').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === '7') {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

		        var self = this;
	        	$('#Cod').blur(function() {
	        		var customer = "http://was-dev/Focus24/Services/VP.svc/custumer/" + $('#Cod').val() + "/" + (self.usr.TIPO === "GESTOR" ? self.usr.VKBUR : self.usr.CodRepresentante);
			        $.getJSON(customer +"?callback=?", function (data) {

			        	// Se o retorno for null, apresenta mensagem "Código não encontrado" e insere o focus no campo "Código"
			        	
			        	if (data.Status === null) {
			        		$('p.success').addClass('hide');
			        		$('p.error').removeClass('hide').text('Código não encontrado. Digite novamente...');
			        		$('input').val('');
			        		$('a.btn.next').hide();
			        		$('.canDisable').removeAttr('disabled');
			        		$('#Cod').focus();
			        	}

			        	// Se o retorno for False, apresenta mensagem "Cliente com restrição"
			        	
			        	if (data.Status === "False") {
							$.each(data, function(index, value) {
							    $('input[type=text]').each(function() {
							    	if ($(this).attr('id') === index) {
							    		$(this).val(value);
							    	}
							    });
							});
							$('a.btn.next').hide();
			                $('p.success').addClass('hide');
			                $('.canDisable').not('#Cod').attr('disabled', 'disabled');
			        		$('p.error').removeClass('hide').text('Cliente com restrição. Consultar Depto. Financeiro. Processo interrompido.');
			        	}

			        	// Se o retorno for True, auto-completa todos os campos
			        	
			        	if (data.Status === "True") {
				            try {
								$.each(data, function(index, value) {
								    $('input[type=text]').each(function() {
								    	if ($(this).attr('id') === index) {
								    		$(this).val(value);
								    	}
								    });
								});
			        			$('a.btn.next').show();
				                $('p.error').addClass('hide');
				                $('p.success').removeClass('hide');
				                $('a.btn.next').removeClass('hide');
				                $('.canDisable').not('#Cod').attr('disabled', 'disabled');
				            } catch (ex) {}
				        }
			        });
	        	});

				// Ao apertar a tecla ENTER, auto-completa todos os campos
				
				$('#Cod').keypress(function(e) {
			    	if (e.which === 13) {
		        		var customer = "http://was-dev/Focus24/Services/VP.svc/custumer/" + $('#Cod').val() + "/" + (self.usr.TIPO === "GESTOR" ? self.usr.VKBUR : self.usr.CodRepresentante);
				        
				        $.getJSON(customer + "?callback=?", function (data) {
				        	if (data.Status === null) {
				        		$('input').val('');
				        		$('a.btn.next').hide();
				        		$('p.success').addClass('hide');
				        		$('.canDisable').removeAttr('disabled');
				        		$('p.error').removeClass('hide').text('Código não encontrado. Digite novamente...')
				        		$('#Cod').focus();
				        	} 

				        	if (data.Status === "False") {
								$.each(data, function(index, value) {
								    $('input[type=text]').each(function() {
								    	if ($(this).attr('id') === index) {
								    		$(this).val(value);
								    	}
								    });
								});
								$('a.btn.next').hide();
								$('p.success').addClass('hide');
								$('.canDisable').not('#Cod').attr('disabled', 'disabled');
				        		$('p.error').removeClass('hide').text('Cliente com restrição. Consultar Depto. Financeiro. Processo interrompido.');
				        	}

				        	if (data.Status === "True") {
					            try {
									$.each(data, function(index, value) {
									    $('input[type=text]').each(function() {
									    	if ($(this).attr('id') === index) {
									    		$(this).val(value);
									    	}
									    });
									});
					                $('p.error').addClass('hide');
					                $('p.success').removeClass('hide');
				        			$('a.btn.next').show();
					                $('a.btn.next').removeClass('hide');
					                $('.canDisable').not('#Cod').attr('disabled', 'disabled');
					            } catch (ex) {}
					        }
				        });
			    	}
	        	});

				// Grava os dados inseridos pelo usuário na tela “Identificação do Cliente”
	        	
	        	$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
		        			if (result === 'ANDAMENTO') {
			        			if (!$("#Marca").val().length) {
			        				$("#Marca").val('-');
			        			}

								var Customer = {
									Cod: $('#Cod').val(),
									Marca: $("#Marca").val(),
									Contato: $("#Contato").val(),
									Email: $("#Email").val(),
									Telefone: $("#Telefone").val(),
									VPNumber: ""
								}

								$.ajax({
									url: 'http://was-dev/Focus24/Services/VP.svc/Savecustumer/0',
									data: JSON.stringify(Customer),
									type: 'POST',
									contentType: "application/json; charset=utf-8",
									traditional: true,
									success: function(data) {console.log(data);vendapersonalizada.vpCode=data;vendapersonalizada.navPage();},
								});
							}

							// Se o status da VP for "REVENDO", não cria uma nova VP, atualiza, passando o número de VP no campo VPNumber
		        			
		        			if (result === 'REVENDO') {
			        			if (!$("#Marca").val().length) {
			        				$("#Marca").val('-');
			        			}

								var Customer = {
									Cod: $('#Cod').val(),
									Marca: $("#Marca").val(),
									Contato: $("#Contato").val(),
									Email: $("#Email").val(),
									Telefone: $("#Telefone").val(),
									VPNumber: vendapersonalizada.vpData[0].VPNumber
								}

								$.ajax({
									url: 'http://was-dev/Focus24/Services/VP.svc/Savecustumer/0',
									data: JSON.stringify(Customer),
									type: 'POST',
									contentType: "application/json; charset=utf-8",
									traditional: true,
									success: function(data) {console.log(data);vendapersonalizada.vpCode=data;vendapersonalizada.navPage();},
								});
							}
			        	}
		        	})
	        	});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});
	        },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Segmentação`
			    * * Used webservices: getVP, SalvaSegmentacao
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        segmentacao: function(code) {
	        	vendapersonalizada.setCounter();
				vendapersonalizada.navButtons(0);

	        	$('body main section form.segmentacao > fieldset > .content > .radio input[type=radio]').click(function() {
	        		$('.btn.next').hide();
			    	$('.l-both ul.radio-buttons').addClass('off');
			    	$('input').not($(this)).prop('checked', false);
			    	$('.networkFields input').not('#redeLojas').prop('disabled', true);
	        		
	        		var _t = $(this);
	        		_t.closest('form').find('div.l-both > ul').addClass('hide');

	        		switch($(this).val()) {
	        			case 'yes':
	        				_t.closest('form').find('div.l-both').removeClass('hide').find(' > ul:eq(0)').removeClass('hide');
	        				break;
	        			case 'no':
	        				_t.closest('form').find('div.l-both').removeClass('hide').find(' > ul:eq(1)').removeClass('hide');
	        				break;
	        		}
	        		vendapersonalizada.navButtons(1);
	        	});

				if (code !== "new") {

					// Caso não seja uma nova VP, checka os campos escolhidos anteriormente
                    
                    var retorno = vendapersonalizada.vpData[1];
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

			        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
			        	var retorno = JSON.parse(dadosRetorno)[1];

			        	if (retorno) {
                            var cBoxesList = retorno.Opcoes.split(',');
                            if (retorno.CompraFocus) {
                                try {
                                    $('#yes').trigger('click');
                                    $('input').each(function() {
                                        currentBox = ($.inArray($(this).attr('id'), cBoxesList));
                                        if (currentBox !== -1) {
                                            $(this).trigger('click');
                                        }
                                    });
                                } catch (ex) {}
                            } else {
                                try {
                                    $('#no').trigger('click');
                                    $('input').each(function() {
                                        currentBox = ($.inArray($(this).attr('id'), cBoxesList));
                                        if (currentBox !== -1) {
                                            $(this).trigger('click');
                                        }
                                    });
                                } catch (ex) {}
                            }

                            if ($('#redeLojas').is(':checked')) {
                            	$('.l-both ul.radio-buttons').removeClass('off');
                                $('.networkFields input').not('#redeLojas').prop('disabled', false);

                                if (retorno.GrandePorte) {
                                    $('#big').trigger('click');
                                    $('#big').prop('checked', true);
                                } else {
                                    $('#small').trigger('click');
                                    $('#small').prop('checked', true);
                                }
                            }

                            // Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
				            
				            var complete = true;
				            $('input').each(function() {
				                if (!$('.choose-cboxes input[type=checkbox]:checked').length || !$('.choose-radio input[type=radio]:checked').length) {
				                    complete = false;
				                }
				            });

				            if ($('#redeLojas').is(':checked')) {
				            	if (!$('input[name=companySize]').is(':checked')) {
				            		complete = false;
				            	}
				            }

				            if (complete) {
				                $('a.btn.next').removeClass('hide');
				            } else {
				            	$('a.btn.next').addClass('hide');
				            }

				            if (complete && $('em').eq(0).text() === "7") {
				                $('.btn.finish').removeClass('hide');
				            } else {
				            	$('.btn.finish').addClass('hide');
				            }
                            vendapersonalizada.vpFinalizada();
                        }
			        });

					$('div.l-both').removeClass('hide');

	        		if ($("#yes").is(':checked')) {
	        			$('.contentA').removeClass('hide');
	        		}

	        		if ($("#no").is(':checked')) {
						$('.contentB').removeClass('hide');
	        		}
				}

			    $('#redeLojas').click(function() {
				    if ($(this).is(':checked')) {
				    	$('.networkFields input').not('#redeLojas').prop('disabled', false);
				    	$('.l-both ul.radio-buttons').removeClass('off');
				    }
				});

				$('#gestorMarca').click(function() {
				    if ($(this).is(':checked')) {
				    	$('.l-both ul.radio-buttons').addClass('off');
				    	$('.networkFields input').not('#redeLojas').prop('disabled', true);
				    	$('.networkFields input').prop('checked', false);
				    }
				});

				// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('input').on('change', function() {
		            var complete = true;

		            $('input').each(function() {
		                if (!$('.choose-cboxes input[type=checkbox]:checked').length || !$('.choose-radio input[type=radio]:checked').length) {
		                    complete = false;
		                }
		            });

		            if ($('#redeLojas').is(':checked')) {
		            	if (!$('input[name=companySize]').is(':checked')) {
		            		complete = false;
		            	}
		            }

		            if (complete) {
		                $('a.btn.next').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	// Grava os dados inseridos pelo usuário na tela “Segmentação”
	        	
	        	$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
			        		$('form').each(function() {
								$('div.l-both > ul.hide li div input').prop('checked', false);
							});

			        		array = [];
		        			$('input:checked').not('#yes, #no, #big, #small').each(function() {
		        				array.push($(this).val());
		        			});

		        			array = array.join(',');
			        		if ($("#yes").is(':checked')) {
								var Segmento = {
									VPNumber: vendapersonalizada.vpData[0].VPNumber,
									CompraFocus: true,
									GrandePorte: false,
									Opcoes: array
								}

								$.ajax({
									url: 'http://was-dev/Focus24/Services/VP.svc/SalvaSegmentacao/0',
									data: JSON.stringify(Segmento),
									type: 'POST',
									contentType: "application/json; charset=utf-8",
									traditional: true,
									success: function(data) {console.log(data);vendapersonalizada.navPage();},
								});
							}

							if ($("#no").is(':checked')) {
								isBig = false;

								if ($('#big').is(':checked')) {	
									isBig = true;
								}

								var Segmento = {
									VPNumber: vendapersonalizada.vpData[0].VPNumber,
									CompraFocus: false,
									GrandePorte: isBig,
									Opcoes: array
								}

								$.ajax({
									url: 'http://was-dev/Focus24/Services/VP.svc/SalvaSegmentacao/0',
									data: JSON.stringify(Segmento),
									type: 'POST',
									contentType: "application/json; charset=utf-8",
									traditional: true,
									success: function(data) {console.log(data);vendapersonalizada.navPage();},
								});
							}
						}
					});
	        	});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				})
	        },
	        
	        base: function(code) {
	        	vendapersonalizada.setCounter();
	        	vendapersonalizada.navButtons(0);
	        	var code = location.hash.split('#/solicitacao/base/')[1];

	        	if (code !== "new") {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

			        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		            	var retorno = JSON.parse(dadosRetorno)[2];
		            	if (retorno !== null) {
			            	if (retorno.Novo === false) {
			            		$('body main section form.base > fieldset .btns a').eq(0).trigger('click');
			            		$('input[name=baseType]:checked').each(function() {
			            			$(this).trigger('click');
			            		})
				            }

				            if (retorno.Novo === true) {
				            	$('body main section form.base > fieldset .btns a').eq(1).trigger('click');
				            }
				        }
			        });
				}
	        	$('body main section form.base > fieldset .btns a').click(function() {
	        		$(this).parent().find('a').removeClass('active');
	        		$(this).addClass('active');
	        		$('a.btn.next, a.btn.prev').off();
	        		var _f = $(this).closest('form');
	        		var _v = $(this).attr('data-value');
	        		_f.find('.base').addClass('hide');

	        		switch(_v) {
	        			case '1':
	        				$('a.btn.next').addClass('hide');
	        				$('a.btn.finish').addClass('hide');
	        				_f.find('div.existBase').removeClass('hide');
	        				vendapersonalizada.existBase();
	        				break;
	        			case '0':
	        				$('a.btn.next').addClass('hide');
	        				$('a.btn.finish').addClass('hide');
	        				_f.find('div.newBase').removeClass('hide');
	        				vendapersonalizada.newBase();
	        				break;
	        		}
	        		vendapersonalizada.navButtons(1);
	        	});
	        },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Necessidade do Cliente > Base Nova`
			    * * Used webservices: getMat, getVP, SalvaBase
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        newBase: function(code) {
	        	vendapersonalizada.setCounter();
	        	var _field = $('#findProduct2');
	        	var _codes = $('ul.block.codes').eq(1);

    			$('#spotlight2').click(function() {
	        		var spotlight = "http://was-dev/Focus24/Services/VP.svc/getMat/" + $('#findProduct2').val().toUpperCase();
			        $.getJSON(spotlight, function (dadosRetorno) {
			        	if (dadosRetorno.BASE !== null) {
				        	content = dadosRetorno;
		        			_codes.html('<li style="display:none"><p>'+ content.MATNR + ' - ' + content.MAKTX + '</p><input name="productID" type="hidden" value="'+ content.MATNR + ' - ' + content.BASE + ' - ' + content.MAKTX + '" /><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
			        		_codes.find('li').fadeIn('slow');

			        		$('.codes p').each(function() {
				        		$(this).text($(this).text().substring(0, 9) + ' - ' + content.MAKTX);
			        		})

			        		$('#findProduct2').val('');
			        		_field.attr('disabled', 'disabled');
			        		$(this).attr('disabled', 'disabled');

				            $('.inputs input, .inputs textarea').not('#findProduct2, #spotlight2, input[name=productID], input[name=gram]').each(function() {
				                if ($(this).val().length) {
				                    $('a.btn.next').removeClass('hide');
				                }
				            });
			        		action();
			        	} else {
			        		var modal=new Modal();
	        				modal.open('Código não encontrado!',"Digite novamente.",!0,!1);
			        		$('a.btn.next').addClass('hide');
			        		_field.val('');
			        		_field.focus();
			        	}
			        });
				});
	        	var action = function() {
	        		_codes.find('a.ico-circle').unbind('click').click(function() {
	        			$(this).closest('li').fadeOut(400,function() {
	        				$(this).remove();
	        			});

	        			$('#findProduct2').val('');
		        		$('#findProduct2').attr('disabled', false);
		        		$('#spotlight2').attr('disabled', false);
		        		$('a.btn.next').addClass('hide');
	        		});
	        	}
	        	action();

	        	$('body main section form.base > fieldset .newBase input[name=baseType]').click(function() {
					$(this).closest('.newBase').find('>*:not(.l-bottom)').addClass('hide');
					$('input').not($(this)).prop('checked', false);
					$('input[type=text], textarea').val('');

					switch($(this).val()) {
	        			case 'Nova':
	        				$('a.btn.next').addClass('hide');
	        				$('.btn.finish').addClass('hide');
			        		$(this).closest('.newBase').find('>ul').removeClass('hide');
	        				break;
	        			case 'Similar':
	        				$('a.btn.next').addClass('hide');
	        				$('.btn.finish').addClass('hide');
	        				$(this).closest('.newBase').children('.similar').removeClass('hide');
	        				break;
	        		}
	        	});

	        	var code = location.hash.split('#/solicitacao/base/')[1];
	        	if (code !== "new") {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
			        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		            	var retorno = JSON.parse(dadosRetorno)[2];
		            	if (retorno !== null) {
			            	var inputList = retorno.Alteracao.split(',');
				            try {
				            	if (retorno.Similar === true) {
				            		var i = 0;
				            		$('#baseTypeA').trigger('click');
					            	
					            	if (!$('ul.block.codes li').length) {
					            		if (retorno.CodigoAmostra.length) {
					            			specify = retorno.Alteracao.split('- ')[1].split(',')[0];
							            	$('ul.block.codes').eq(1).html('<li style="display:none"><p>'+ retorno.CodigoAmostra + ' - ' + specify + '</p><input name="productID" type="hidden" value="'+ retorno.CodigoAmostra + ' - ' + inputList[11] + ' - ' + specify + '" /><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>')
							            	
							            	if ($('ul.block.codes li').length) {
								        		$('#findProduct2').attr('disabled', 'disabled');
								        		$('#spotlight2').attr('disabled', 'disabled');
							            	}
							            }
						            }

					            	$('.inputs input[value=""], .inputs textarea').not('#findProduct2, #spotlight2').each(function() {
					            		splitedData = inputList[i].split(':');
					            		if ($(this).attr('id') === splitedData[0]) {
					            			$(this).val(splitedData[1]);
					            			i++;
					            		}
						            });

						            $('#nec, #nec2').each(function() {
						            	if ($(this).attr('id') === inputList[9].split(':')[0]) {
						            		$(this).trigger('click');
						            	}
						            });

						            $('a.btn.next').removeClass('hide');
						            if ($('em').eq(0).text() === "7") {
						                $('.btn.finish').removeClass('hide');
						            } else {
						            	$('.btn.finish').addClass('hide');
						            }
						            action();
					            }

				            	if (retorno.Similar === false) {
				            		$('#baseTypeB').trigger('click');
				            		$('#' + [inputList[0]]).trigger('click');
				            		$('#' + [inputList[1]]).trigger('click');

				            		if ($('#outros').is(':checked')) {
				            			currentInput = inputList[5].split(':');
				            			$('#specify').val(currentInput[1]);
				            		}

				            		textArea = inputList[4].split(':');
				            		$('#others').val(textArea[1]);
				            		$('a.btn.next').removeClass('hide');

						            if ($('em').eq(0).text() === "7") {
						                $('.btn.finish').removeClass('hide');
						            } else {
						            	$('.btn.finish').addClass('hide');
						            }
					            }
					            vendapersonalizada.vpFinalizada();
				            } catch (ex) {}
				        }
			        });
				}

				$('input[name=newBase]').click(function() {
					if ($(this).attr('id') === "outros") {
						$('#specify').removeAttr('disabled');
					} else {
						$('#specify').attr('disabled', true);
						$('#specify').val('');
					}
				});

				function hasDuplicates(array) {
				    var valuesSoFar = Object.create(null);
				    for (var i = 0; i < array.length; ++i) {
				        var value = array[i];
				        if (value in valuesSoFar) {
				            return true;
				        }
				        
				        valuesSoFar[value] = true;
				    }
				    return false;
				}

				// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('.inputs input, .inputs textarea').on('input', function() {
		            var complete = true;

		            $('.base-changes input').not('input[type=radio]').each(function() {
		            	if (!$(this).val().length) {
		            		complete = false;
		            	} else {
		            		complete = true;
		            		return !1;
		            	}
		            });

		            if ($('#grammageA').val().length && !$('#nec:checked, #nec2:checked').length) {
		            	complete = false;
		            }

		            if (!$('#others2').val().length) {
		            	complete = false;
		            }

		            if (!$('ul.codes li').length) {
		            	complete = false;
		            }

		            if (complete) {
		                $('a.btn.next').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

				$('.inputs .radio').on('change', function() {
		            var complete = true;

		            $('.base-changes input').not('input[type=radio]').each(function() {
		            	if (!$(this).val().length) {
		            		complete = false;
		            	} else {
		            		complete = true;
		            		return !1;
		            	}
		            });

		            if ($('#grammageA').val().length && !$('#nec:checked, #nec2:checked').length) {
		            	complete = false;
		            }

		            if (!$('#others2').val().length) {
		            	complete = false;
		            }

		            if (!$('ul.codes li').length) {
		            	complete = false;
		            }

		            if (complete) {
		                $('a.btn.next').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
				});

		        // Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('.choose-radio input, .choose-radio #others').on('change', function() {
		            var complete = true;

		            $('input, #others').each(function() {
			            if ($('#outros').is(':checked')) {
				            if (!$('#specify').val().length) {
				            	complete = false;
				            }
				        }

			            if (!$('#others').val().length) {
			            	complete = false;
			            }
		            });

		            if (complete) {
		                $('a.btn.next.hide').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('.choose-radio input, .choose-radio #others').on('keyup', function() {
		            var complete = true;

		            $('input, #others').each(function() {
						if ($('#outros').is(':checked')) {
				            if (!$('#specify').val().length) {
				            	complete = false;
				            }
				        }

			            if (!$('#others').val().length) {
			            	complete = false;
			            }
		            });

		            if (complete) {
		                $('a.btn.next.hide').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	// Grava os dados inseridos pelo usuário na tela “Necessidade do Cliente”
	        	
	        	$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
			        		array = [];
							if ($('a.btn.dark.left').eq(1).hasClass('active')) {
								if ($('#baseTypeA').is(':checked')) {
				        			$('.inputs input, .inputs textarea').not('input[name=productID], #findProduct2, #spotlight2, #nec, #nec2').each(function() {
				        				array.push($(this).attr('id') + ":" + $(this).val());
				        			});

				        			$('input[name=gram]').each(function() {
				        				if ($(this).is(':checked')) {
				        					array.push($(this).attr('id') + ":" + $(this).attr('id'));
				        				}
				        			});

				        			array.push($('ul.codes li').text());
				        			array.push($('[name=productID]').val().split(' - ')[1]);
				        			array = array.join(',')
									var Base = {
										Alteracao: array,
										CodigoAmostra: $('input[name="productID"]').val().split(' - ')[0],
										Novo: true,
										Similar: true,
										VPNumber: vendapersonalizada.vpData[0].VPNumber
									}

									$.ajax({
										url: 'http://was-dev/Focus24/Services/VP.svc/SalvaBase/0',
										data: JSON.stringify(Base),
										type: 'POST',
										contentType: "application/json; charset=utf-8",
										traditional: true,
										success: function(data) {console.log(data);vendapersonalizada.navPage();},
									});
								}

								if ($('#baseTypeB').is(':checked')) {
				        			$('div.radio input[name=newBase]:checked, div.radio input[name=type]:checked').each(function() {
				        				array.push($(this).attr("id"));
				        			});

				        			$('div.radio input[name=newBase]:checked, div.radio input[name=type]:checked').each(function() {
				        				array.push($(this).attr("data-text"));
				        			});

				        			$('#others').each(function() {
				        				if ($(this).val().length) {
				        					array.push($(this).attr('id') + ":" + $(this).val());
				        				}
				        			});

									$('#specify').each(function() {
										if ($(this).val().length) {
				        					array.push($(this).attr('id') + ":" + $(this).val());
				        				}
				        			});

				        			array = array.join(',')
									var Base = {
										Alteracao: array,
										CodigoAmostra: "",
										Novo: true,
										Similar: false,
										VPNumber: vendapersonalizada.vpData[0].VPNumber
									}

									$.ajax({
										url: 'http://was-dev/Focus24/Services/VP.svc/SalvaBase/0',
										data: JSON.stringify(Base),
										type: 'POST',
										contentType: "application/json; charset=utf-8",
										traditional: true,
										success: function(data) {console.log(data);vendapersonalizada.navPage();},
									});
								}
							}
						}
					});
				});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				});
	        },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Necessidade do Cliente > Base Existente`
			    * * Used webservices: getMat, getVP, SalvaBase
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        existBase: function(code) {
	        	vendapersonalizada.setCounter();

	        	var _field = $('#findProduct');
	        	var _codes = $('ul.block.codes').eq(0);

    			$('#spotlight').click(function() {
	        		var spotlight = "http://was-dev/Focus24/Services/VP.svc/getMat/" + $('#findProduct').val().toUpperCase();

			        $.getJSON(spotlight, function (dadosRetorno) {
			        	if (dadosRetorno.BASE !== null) {
				        	content = dadosRetorno;
		        			_codes.html('<li style="display:none"><p>'+ content.MATNR + ' - ' + content.MAKTX + '</p><input name="productID" type="hidden" value="'+ content.MATNR + ' - ' + content.MAKTX + '" /><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
			        		_codes.find('li').fadeIn('slow');
			        		$('#findProduct').val('');
			        		_field.attr('disabled', 'disabled');
			        		$(this).attr('disabled', 'disabled');

			                if ($('.choose-cboxes input[type=radio]:checked').length) {
			                    $('.btn.next.hide').removeClass('hide');
			                }
			        		action();
			        	} else {
			        		var modal=new Modal();
	        				modal.open('Código não encontrado!',"Digite novamente.",!0,!1);
			        		_field.val('');
			        		_field.focus();
			        	}
			        });
				});

	        	var action = function() {
	        		_codes.find('a.ico-circle').unbind('click').click(function() {
	        			$(this).closest('li').fadeOut(400,function() {
	        				$(this).remove();
	        			});
	        			$('#findProduct').val('');
		        		$('#findProduct').attr('disabled', false);
		        		$('#spotlight').attr('disabled', false);
		        		$('.btn.next').addClass('hide');
	        		});
	        	}
	        	action();

	        	var code = location.hash.split('#/solicitacao/base/')[1];
	        	if (code !== "new") {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

			        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		            	var retorno = JSON.parse(dadosRetorno)[2];
		            	var cBoxesList = retorno.Alteracao.split(',');
			            try {
			            	if (!$('ul.block.codes li').length) {
			            		if (retorno.CodigoAmostra.length) {
			            			specify = retorno.Alteracao.split('- ')[1];
					            	$('ul.block.codes').eq(0).append('<li style="display:none"><p>'+ retorno.CodigoAmostra + ' - ' + specify + '</p><input name="productID" type="hidden" value="'+ retorno.CodigoAmostra + ' - ' + specify + '" /><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>')
					            	
					            	if ($('ul.block.codes li').length) {
						        		$('#findProduct').attr('disabled', 'disabled');
						        		$('#spotlight').attr('disabled', 'disabled');
					            	}
					            }
				            }

			            	$('input[type=radio]').each(function() {
			            		currentBox = ($.inArray($(this).attr('id'), cBoxesList));
		        				if (currentBox !== -1) {
		        					$(this).prop('checked', true);
		        				}
		        			});

		        			if ($('ul.block.codes li').length && $('input[type=radio]:checked').length) {
		        				$('.btn.next').removeClass('hide');
		        				
		        				if ($('em').eq(0).text() === "7") {
		        					$('a.btn.finish').removeClass('hide');
		        				}
		        			}
			            } catch (ex) {}
			            action();
			        });
			    }

			    // Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('input, ul.codes li').on('change', function() {
		            var complete = true;
		            
		            $('input').each(function() {
		                if (!$('.choose-cboxes input[type=radio]:checked').length) {
		                    complete = false;
		                }
		            });

		            if (!$('ul.codes li').length) {
		            	complete = false;
		            }

		            if (complete) {
		                $('.btn.next.hide').removeClass('hide');
		            } else {
		            	$('.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
			        		array = [];
							if ($('a.btn.dark.left').eq(0).hasClass('active')) {
			        			$('input[type=radio]:checked').each(function() {
			        				array.push($(this).attr("id"));
			        			});

			        			$('input[type=radio]:checked').each(function() {
			        				array.push($(this).attr("data-text"));
			        			});

			        			array.push($('ul.codes li').text());
			        			array = array.join(',')
								var Base = {
									Alteracao: array,
									CodigoAmostra: $('ul.codes li').text().split(' -')[0],
									Novo: false,
									Similar: false,
									VPNumber: vendapersonalizada.vpData[0].VPNumber
								}

								$.ajax({
									url: 'http://was-dev/Focus24/Services/VP.svc/SalvaBase/0',
									data: JSON.stringify(Base),
									type: 'POST',
									contentType: "application/json; charset=utf-8",
									traditional: true,
									success: function(data) {console.log(data);vendapersonalizada.navPage();},
								});
							}
						}
					});
				});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				});
	        },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Amostra`
			    * * Used webservices: ExcluirAmostra, getVP, SalvaAmostra
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        amostra: function(code) {
	        	vendapersonalizada.setCounter();
	        	var _field = $('#pantoneCode');
	        	var _codes = $('ul.block.codes');

	        	$('.sampleOption input[type=radio]').click(function() {
	        		var _t = $(this);
	        		_t.closest('form').find('.sample').addClass('hide');

	        		switch($(this).val()) {
	        			case 'yes':
	        				_t.closest('form').find('.sample').removeClass('hide').find(' > ul:eq(0)').removeClass('hide');
	        				break;
	        			case 'no':
	        				break;
	        		}
	        	});

	        	$('li.pantone a').click(function() {
	        		if (_field.val().length > 0) {
		        		_codes.prepend('<li style="display:none"><p>'+_field.val()+'</p><input id="pantoneCode" name="pantoneCode" type="hidden" value="'+_field.val()+'" /><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
		        		_codes.find('li').fadeIn('slow');
		        		_field.val('');
		        		action();
	        		}
	        	});

	        	var action = function() {
	        		_codes.find('a.ico-circle').unbind('click').click(function() {
	        			$(this).closest('li').fadeOut(400,function() {
	        				$(this).remove();
	        			})
	        		});
	        	}
	        	action();

	        	// Responsável pela exclusão de amostras
				
				$(document).on('click', '#removeSample', function() {
					var ExcluiAmostra = {
						CodAmostra: $(this).attr('sample'),
						VPNumber: vendapersonalizada.vpData[0].VPNumber
					}

					$.ajax({
						url: 'http://was-dev/Focus24/Services/VP.svc/ExcluirAmostra/0',
						data: JSON.stringify(ExcluiAmostra),
						type: 'POST',
						contentType: "application/json; charset=utf-8",
						traditional: true,
						success: function(data) {console.log(data);location.reload();}
					});
				});

        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		            try {
		            	retorno = JSON.parse(dadosRetorno)[3];
		            	vendapersonalizada.vpFinalizada();

		            	if (retorno[0].Tipo === 'sampleNo') {
		            		$('#sampleNo').trigger('click');
		            	}

		            	retorno.sort(function(a1, a2) {
							return a1.CodAmostra - a2.CodAmostra;
						});

		            	if (retorno[0].Tipo !== 'sampleNo') {
		            		$('#sampleYes').trigger('click');

		            		for (i = 0; i < retorno.length; i++) {
		            			splitedData = retorno[i];
		            			splitedData.CodAmostra.sort;
		            			$('ul.codes').eq(1).append('<li><p class="codigoAmostra" value="' + splitedData.CodAmostra + '">VP ' + $('.repre_name').text().split('Nº ')[1] + ' - AMOSTRA ' + splitedData.CodAmostra + '</p><a id="removeSample" title="Excluir" sample="' + splitedData.CodAmostra + '"class="ico-circle right" href="javascript:void(0);"><i class="fa fa-trash" aria-hidden="true"></i></a></li>');
			            	}

				            if ($('p.codigoAmostra').length) {
				                $('.btn.next').removeClass('hide');
				            } else {
				            	$('.btn.next').addClass('hide');
				            }

				            if ($('p.codigoAmostra').length && $('em').eq(0).text() === "7") {
				                $('.btn.finish').removeClass('hide');
				            } else {
				            	$('.btn.finish').addClass('hide');
				            }
		            	}

		            	// Carrega informações da amostra

						$('.codigoAmostra').click(function() {
		            		for (i = 0; i < retorno.length; i++) {
		            			currentCode = retorno[i];

		            			if ($(this).attr('value') === currentCode.CodAmostra) {
		            				$('input').not('#sampleYes').prop('checked', false);
		            				$('ul.block.codes li').remove();

		            				if (currentCode.Devolucao) {
		            					$('#giveBackYes').trigger('click');
		            				} else {
		            					$('#giveBackNo').trigger('click');
		            				}

		            				if (currentCode.Corte) {
		            					$('#couldBeCutYes').trigger('click');
		            				} else {
		            					$('#couldBeCutNo').trigger('click');
		            				}

			            			var cBoxesList = (currentCode.Tipo.split(':') + "," + currentCode.Tipo2.split(':')).split(',');
			            			var codeList = currentCode.Tipo2.split(',');
					            	$('input').not('#catalogoFoto, #amostraEstampa, #roupaConfeccionadaImg, #amostraTecidoImg').each(function() {
					            		currentBox = ($.inArray($(this).attr('id'), cBoxesList));
				        				if (currentBox !== -1) {
				        					if ($(this).attr('id') === $('#pantone')) {
				        						$('.pantoneFields input').not('#pantone').prop('disabled', false);
				        						$('.pantoneFields div.radio').removeClass('disabled');
				        					}
				        					$(this).trigger('click');
				        				}
				        			});

			            			for (x = 0; x < codeList.length; x++) {
				            			splitedData = codeList[x].split(':');

						            	$('ul.block.codes').each(function() {
						            		if (splitedData[0] === "pantoneCode") {
					        					$(this).append('<li style="display:none"><p>'+splitedData[1]+'</p><input id="pantoneCode" name="pantoneCode" type="hidden" value="'+splitedData[1]+'" /><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
					        					action();
					        				}
					        			});

						            	$('textarea').each(function() {
						            		if (splitedData[0] === "others") {
						            			$(this).val(splitedData[1]);
						            		}
						            	});
						            }

						            $('#imgAmostra').attr('src', '');
						            splitImg = currentCode.Tipo.split("'");
						            decodedImg = splitImg[1];
									if (splitImg[0].indexOf('catalogoFoto') !== -1) {
						            	$('#catalogoFoto').prop('checked', true);
						            	$('#photoFile').attr('value', "'"+decodedImg+"'");
										$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+decodedImg+'" width="180" height="180" /></div>');
									}

									if (splitImg[0].indexOf('amostraEstampa') !== -1) {
						            	$('#amostraEstampa').prop('checked', true);
						            	$('#photoFile2').attr('value', "'"+decodedImg+"'");
										$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+decodedImg+'" width="180" height="180" /></div>');
									}

									if (splitImg[0].indexOf('roupaConfeccionadaImg') !== -1) {
						            	$('#roupaConfeccionadaImg').prop('checked', true);
						            	$('#photoFile3').attr('value', "'"+decodedImg+"'");
										$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+decodedImg+'" width="180" height="180" /></div>');
									}

									if (splitImg[0].indexOf('amostraTecidoImg') !== -1) {
						            	$('#amostraTecidoImg').prop('checked', true);
						            	$('#photoFile4').attr('value', "'"+decodedImg+"'");
										$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+decodedImg+'" width="180" height="180" /></div>');
									}
		            			}
			            	}
						});
		            } catch (ex) {}
		        });

				// Ao clicar em alguma opção, limpa os dados inseridos em outras

	        	$('.optionFields input').click(function() {
	        		if ($(this).attr('id') === 'roupaConfeccionada') {
						$('#roupaConfeccionadaImg').prop('disabled', false);
						$('#amostraTecidoImg').prop('disabled', true);
						$('[for=roupaConfeccionadaImg]').removeClass('off');
						$('[for=amostraTecidoImg]').addClass('off');
						$('.optionFields input').not($('.roupaConfeccionada input')).prop('checked', false);
						$('.optionFields input.hide[value]').not('#photoFile3').attr('value', '');
						$('.imgAmostra img').attr('src', '');
					}

					if ($(this).attr('id') === 'amostraTecido') {
						$('#amostraTecidoImg').prop('disabled', false);
						$('#roupaConfeccionadaImg').prop('disabled', true);
						$('[for=amostraTecidoImg]').removeClass('off');
						$('[for=roupaConfeccionadaImg]').addClass('off');
						$('.optionFields input').not($('.amostraTecido input')).prop('checked', false);
						$('.optionFields .hide[value]').not('#photoFile4').attr('value', '');
						$('.imgAmostra img').attr('src', '');
					}

					if ($(this).attr('id') === 'catalogoFoto') {
						$('#roupaConfeccionadaImg, #amostraTecidoImg').prop('disabled', true);
						$('[for=roupaConfeccionadaImg], [for=amostraTecidoImg]').addClass('off');
						$('.optionFields input').not($('.catalogoFoto input')).prop('checked', false);
						$('.optionFields .hide[value]').not('#photoFile').attr('value', '');
						$('.imgAmostra img').attr('src', '');
					}

					if ($(this).attr('id') === 'amostraEstampa') {
						$('#roupaConfeccionadaImg, #amostraTecidoImg').prop('disabled', true);
						$('[for=roupaConfeccionadaImg], [for=amostraTecidoImg]').addClass('off');
						$('.optionFields input').not($('.amostraEstampa input')).prop('checked', false);
						$('.optionFields .hide[value]').not('#photoFile2').attr('value', '');
						$('.imgAmostra img').attr('src', '');
					}
	        	});

				// Carrega preview e armazena imagem de amostra

	        	$('#catalogoFoto').click(function() {
	        		$('#photoFile').click();
	        	});

	        	$('#amostraEstampa').click(function() {
	        		$('#photoFile2').click();
	        	});

	        	$('#roupaConfeccionadaImg').click(function() {
	        		$('#photoFile3').click();
	        	});

	        	$('#amostraTecidoImg').click(function() {
	        		$('#photoFile4').click();
	        	});

	        	$('#photoFile').on('change', function() {
	        		_val = $(this).val();
	        		$(this).next('em').html(_val);
	        	});

	        	$('#photoFile2').on('change', function() {
	        		_val = $(this).val();
	        		$(this).next('em').html(_val);
	        	});

	        	$('#photoFile3').on('change', function() {
	        		_val = $(this).val();
	        		$(this).next('em').html(_val);
	        	});

	        	$('#photoFile4').on('change', function() {
	        		_val = $(this).val();
	        		$(this).next('em').html(_val);
	        	});

			    File.prototype.convertToBase64 = function(callback) {
					var reader = new FileReader();
					reader.onload = function(e) {
						callback(e.target.result)
					};
					reader.onerror = function(e) {
						callback(null);
					};        
					reader.readAsDataURL(this);
			    };

			    $("#photoFile").on('change',function() {
					var selectedFile = this.files[0];
					selectedFile.convertToBase64(function(base64) {
						$("#photoFile").attr('value', "'"+base64+"'");
						$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+base64+'" width="180" height="180" /></div>');
						$('#catalogoFoto').prop('checked', true);
					});
			    });

			    $("#photoFile2").on('change',function() {
					var selectedFile = this.files[0];
					selectedFile.convertToBase64(function(base64) {
						$("#photoFile2").attr('value', "'"+base64+"'");
						$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+base64+'" width="180" height="180" /></div>');
						$('#amostraEstampa').prop('checked', true);
					});
			    });

			    $("#photoFile3").on('change',function() {
					var selectedFile = this.files[0];
					selectedFile.convertToBase64(function(base64) {
						$("#photoFile3").attr('value', "'"+base64+"'");
						$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+base64+'" width="180" height="180" /></div>');
						$('#roupaConfeccionada').prop('checked', true);
						$('#roupaConfeccionadaImg').prop('checked', true);
					});
			    });

			    $("#photoFile4").on('change',function() {
					var selectedFile = this.files[0];
					selectedFile.convertToBase64(function(base64) {
						$("#photoFile4").attr('value', "'"+base64+"'");
						$('.imgAmostra').replaceWith('<div class="imgAmostra"><img id="imgAmostra" src="'+base64+'" width="180" height="180" /></div>');
						$('#amostraTecidoImg').prop('checked', true);
					});
			    });

			    $('#catalogoFoto').click(function(a) {
			    	$(a.target).prop('checked', false);
			    	$('.imgAmostra').replaceWith('<div class="imgAmostra"></div>');
			    });

			    $('#amostraEstampa').click(function(a) {
			    	$(a.target).prop('checked', false);
			    	$('.imgAmostra').replaceWith('<div class="imgAmostra"></div>');
			    });

			    $('#roupaConfeccionadaImg').click(function(a) {
			    	$(a.target).prop('checked', false);
			    	$('.imgAmostra').replaceWith('<div class="imgAmostra"></div>');
			    });

			    $('#amostraTecidoImg').click(function(a) {
			    	$(a.target).prop('checked', false);
			    	$('.imgAmostra').replaceWith('<div class="imgAmostra"></div>');
			    });

				$('#photoFile').change(function() {
					$("#catalogoFoto").prop('checked', true);
				});

				$('#photoFile2').change(function() {
					$("#amostraEstampa").prop('checked', true);
				});

				$('#photoFile3').change(function() {
					$("#roupaConfeccionadaImg").prop('checked', true);
				});

				$('#photoFile4').change(function() {
					$("#amostraTecidoImg").prop('checked', true);
				});

				// Disponibiliza campos relacionados ao Pantone

			    $('#pantone').click(function() {
				    if ($(this).is(':checked')) {
				    	$('.pantoneFields input').not('#pantone').prop('disabled', false);
				    	$('.pantoneFields div.radio').removeClass('disabled');
				    } else {
				    	$('.pantoneFields input').not('#pantone').prop('disabled', true);
				    	$('.pantoneFields div.radio').addClass('disabled');
				    	$('.pantoneFields input').prop('checked', false);
				    	$('.pantoneFields input').val('');
				    	$('.block.codes li').remove();
				    }
				});

				if ($(window).width() < 768) {
					$('.imgAmostra').remove();
					$('ul.block').eq(0).append('<li><div class="imgAmostra"></div></li>');
				}

				$('a.ico-circle.right').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result === 'ANDAMENTO' || result === 'REVENDO') {
				            if ($('.optionFields input[type=radio]:checked').length && $('.optionFields2 input[type=radio]:checked').length === 2) {
				                $('a.btn').eq(1).removeClass('hide');
								if ($('#pantone').is(':checked')) {
									if (!$('.pantoneFields input[type=radio]:checked').length || !$('.block.codes li').length) {
										$('a.btn').eq(1).addClass('hide');
									}
								}
				            } else {
				            	$('a.btn').eq(1).addClass('hide');
				            }
				        }
			        });
				});

				$('.optionFields input[type=radio], .optionFields2 input[type=radio], .pantoneFields').on('change', function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result === 'ANDAMENTO' || result === 'REVENDO') {
				            if ($('.optionFields input[type=radio]:checked').length && $('.optionFields2 input[type=radio]:checked').length === 2) {
				                $('a.btn').eq(1).removeClass('hide');
								if ($('#pantone').is(':checked')) {
									if (!$('.pantoneFields input[type=radio]:checked').length || !$('.block.codes li').length) {
										$('a.btn').eq(1).addClass('hide');
									}
								}
				            } else {
				            	$('a.btn').eq(1).addClass('hide');
				            }
				        }
				    });
		        });

		        $('input[name=sample]').click(function() {
		        	if ($(this).attr('id') === 'sampleNo') {
		        		$('a.btn.next').removeClass('hide');
			            if ($('em').eq(0).text() === "7") {
			                $('.btn.finish').removeClass('hide');
			            } else {
			            	$('.btn.finish').addClass('hide');
			            }
		        	}

		        	if ($(this).attr('id') === 'sampleYes') {
		        		$('a.btn.next').addClass('hide');
		        		if ($('.codigoAmostra').length) {
		        			$('a.btn.next').removeClass('hide');
		        		}

			            if ($('.codigoAmostra').length && $('em').eq(0).text() === "7") {
			                $('.btn.finish').removeClass('hide');
			            } else {
			            	$('.btn.finish').addClass('hide');
			            }
		        	}
		        });

		        // Grava os dados inseridos pelo usuário na tela “Amostra”
	        	
	        	$('a.btn').eq(1).click(function() {
	        		arrayTipo1 = [];
        			arrayTipo2 = [];

        			$('.block input[type=checkbox]:checked, .block input[type=radio]:checked').each(function() {
        				arrayTipo1.push($(this).attr('id') + ":" + $(this).val());
        				var imgbase = arrayTipo1.indexOf('catalogoFoto:catalogoFoto');
        				var imgbase2 = arrayTipo1.indexOf('amostraEstampa:amostraEstampa');
        				var imgbase3 = arrayTipo1.indexOf('roupaConfeccionadaImg:roupaConfeccionadaImg');
        				var imgbase4 = arrayTipo1.indexOf('amostraTecidoImg:amostraTecidoImg');

						if (imgbase !== -1) {
						    arrayTipo1[imgbase] = "catalogoFoto:" + $("#photoFile").attr('value');
						}	
						if (imgbase2 !== -1) {
						    arrayTipo1[imgbase2] = "amostraEstampa:" + $("#photoFile2").attr('value');
						}

						if (imgbase3 !== -1) {
						    arrayTipo1[imgbase3] = "roupaConfeccionadaImg:" + $("#photoFile3").attr('value');
						}

						if (imgbase4 !== -1) {
						    arrayTipo1[imgbase4] = "amostraTecidoImg:" + $("#photoFile4").attr('value');
						}
        			});

        			$('.pantoneFields input[type=checkbox]:checked, textarea').each(function() {
        				arrayTipo2.push($(this).attr('id') + ":" + $(this).val());
        			});

        			$('div.radio input[name=info]:checked, .block.codes input').each(function() {
        				arrayTipo2.push($(this).attr('id') + ":" + $(this).attr('value'));
        			});

        			arrayTipo1 = arrayTipo1.join(',');
        			arrayTipo2 = arrayTipo2.join(',');

        			if (vendapersonalizada.vpData[3].length) {
	        			if (vendapersonalizada.vpData[3][0].Tipo === 'sampleNo') {

	        				// Se 'sampleNo', remove amostras
							
							var ExcluiAmostra = {
								CodAmostra: '',
								VPNumber: vendapersonalizada.vpData[0].VPNumber
							}

							$.ajax({
								url: 'http://was-dev/Focus24/Services/VP.svc/ExcluirAmostra/0',
								data: JSON.stringify(ExcluiAmostra),
								type: 'POST',
								contentType: "application/json; charset=utf-8",
								traditional: true,
								success: function(data) {}
							});
						}
					}

					var Amostra = {
						CodAmostra: '',
						Corte: $('div.radio input[name=couldBeCut]').prop('checked'),
						Devolucao: $('div.radio input[name=giveBack]').prop('checked'),
						Tipo: arrayTipo1,
						Tipo2: arrayTipo2,
						VPNumber: vendapersonalizada.vpData[0].VPNumber
					}

					$.ajax({
						url: 'http://was-dev/Focus24/Services/VP.svc/SalvaAmostra/0',
						data: JSON.stringify(Amostra),
						type: 'POST',
						contentType: "application/json; charset=utf-8",
						traditional: true,
						success: function(data) {
							$('.codes').eq(1).append('<li><p class="codigoAmostra" value="' + Amostra.CodAmostra + '">VP ' + $('.repre_name').text().split('Nº ')[1] + ' -  AMOSTRA ' + data + '</p><a id="removeSample" title="Excluir" sample="' + Amostra.data + '"class="ico-circle right" href="javascript:void(0);"><i class="fa fa-trash" aria-hidden="true"></i></a></li>');
							location.reload();
						},
					});
	        	});

				$('a.btn.next').click(function() {

					// Se 'sampleNo', remove amostras e salva tela

					if ($('#sampleNo').is(':checked')) {
						var ExcluiAmostra = {
							CodAmostra: '',
							VPNumber: vendapersonalizada.vpData[0].VPNumber
						}
						
						$.ajax({
							url: 'http://was-dev/Focus24/Services/VP.svc/ExcluirAmostra/0',
							data: JSON.stringify(ExcluiAmostra),
							type: 'POST',
							contentType: "application/json; charset=utf-8",
							traditional: true,
							success: function(data) {
								var Amostra = {
									CodAmostra: '',
									Corte: false,
									Devolucao: false,
									Tipo: 'sampleNo',
									Tipo2: 'sampleNo',
									VPNumber: vendapersonalizada.vpData[0].VPNumber
								}

								$.ajax({
									url: 'http://was-dev/Focus24/Services/VP.svc/SalvaAmostra/0',
									data: JSON.stringify(Amostra),
									type: 'POST',
									contentType: "application/json; charset=utf-8",
									traditional: true,
									success: function(data) {vendapersonalizada.navPage();},
								});
							}
						});
					} else {
						vendapersonalizada.navPage();
					}
				});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				});
	        },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Finalidade do Proposta`
			    * * Used webservices: getVP, SalvaFinalidade
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        finalidadeProduto: function(code) {
	        	vendapersonalizada.setCounter();

	        	$('form.finalidade_produto fieldset .l-bottom:not(.wholesaleSector):not(.anotherPurpose) p.title').click(function() {
					var _i = $(this).find('span i');
					_i.removeClass('fa-chevron-up').addClass('fa-chevron-down');

	        		$(this).next('ul').fadeToggle(400,function() {
						($(this).is(':hidden')) ? _i.removeClass('fa-chevron-down').addClass('fa-chevron-up'):null;
	        		});
	        	});

	        	if (code !== "new") {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

			        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
			            try {

			            	// Se não for uma nova VP, checka e preenche os campos informados anteriormente 
			            	
			            	var retorno = JSON.parse(dadosRetorno)[4];
							var array = ((retorno[0].Segmento) + "," + (retorno[0].Modelagem) + "," + (retorno[0].Top) + "," + (retorno[0].Bottom) + "," + (retorno[0].Home) + "," + (retorno[0].Estamparia) + "," + (retorno[0].Moda));
			            	array = array.split(',');

			            	$('input[type=checkbox]').each(function() {
			            		currentBox = ($.inArray($(this).attr('id'), array));
		        				if (currentBox !== -1) {
		        					$(this).trigger('click');
		        				}
		        			});

		        			$('#setorCalcadista').val(retorno[0].Setor);
		        			$('#outraFinalidade').val(retorno[0].OutraFinalidade);

		        			// Apresenta a div, caso haja algum campo checkado ou preenchido nela
							
							$('div.l-bottom').each(function() {
								cBoxes = $(this).find('input[type=checkbox]:checked');

								for (i = 0; i < cBoxes.length; i++) {
									currentBox = cBoxes[i];
									if ($(this).hasClass($(currentBox).attr('name'))) {
										$(this).find('ul').css('display', 'block');
									}
								}
							});
			            } catch (ex) {}

			            // Carrega os campos "Outros"

			            if (array !== undefined) {
	            			for (x = 0; x < array.length; x++) {
	            				splitedData = array[x].split(':');

				            	$('input[type=text]').each(function() {
				            		if ($(this).attr('id') === splitedData[0]) {
				            			$(this).val(splitedData[1]);
			        				}

									if ($(this).val().length) {
										$(this).parents('ul').css('display', 'block');
									}
			        			});
				            }
				            $('a.btn.next').removeClass('hide');
				        }
			        });
					vendapersonalizada.vpFinalizada();
				}

				// Disponibiliza campo "Outros" para preenchimento e limpa caso seja desmarcado

				$('input[value=outros]').click(function() {
					var self = $(this);

					$('input[type=text]').each(function() {
						if (self.is(':checked') && self.attr('name') === $(this).attr('name')) {
							$(this).attr('disabled', false);
							$(this).val('');
						} else {
							if (self.attr('name') === $(this).attr('name')) {
								$(this).attr('disabled', true);
								$(this).val('');
							}
						}
					});
				});

				// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('input').on('change', function() {
		            var complete = true;

		            $('input[type=checkbox]').each(function() {
		                if (!$('input[type=checkbox]:checked').not('[value=outros]').length) {
		                    complete = false;
		                }

			            $('input[type=text]').each(function() {
			                if ($(this).val().length) {
			                    complete = true;
			                }
			            });
		            });

		            if (complete) {
		                $('a.btn.next.hide').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('input[type=text]').on('keyup', function() {
		            var complete = true;

		            $('input[type=checkbox]').each(function() {
		                if (!$('input[type=checkbox]:checked').not('[value=outros]').length) {
		                    complete = false;
		                }

			            $('input[type=text]').each(function() {
			                if ($(this).val().length) {
			                    complete = true;
			                }
			            });
		            });

		            if (complete) {
		                $('a.btn.next.hide').removeClass('hide');
		            } else {
		            	$('a.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	// Grava os dados inseridos pelo usuário na tela “Finalidade do Produto”
	        	
	        	$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
			        		var arraySegmento =	[];
			        		var arrayModelagem = [];
			        		var arrayTop = [];
			        		var arrayBottom = [];
			        		var arrayHome = [];
			        		var arrayEstamparia = [];
			        		var arrayModa = [];

		        			$('input[name=segment]:checkbox:checked').each(function() {
		        				arraySegmento.push($(this).attr('id'));
		        			});

		        			$('input[name=modeling]:checkbox:checked').each(function() {
		        				arrayModelagem.push($(this).attr('id'));
		        			});
		        			$('input[name=top]:checkbox:checked').each(function() {
		        				arrayTop.push($(this).attr('id'));
		        			});

		        			$('input[name=bottom]:checkbox:checked').each(function() {
		        				arrayBottom.push($(this).attr('id'));
		        			});

		        			$('input[name=home]:checkbox:checked').each(function() {
		        				arrayHome.push($(this).attr('id'));
		        			});

							$('input[name=stampingBase]:checkbox:checked').each(function() {
		        				arrayEstamparia.push($(this).attr('id'));
		        			});

		        			$('input[name=underwear]:checkbox:checked').each(function() {
		        				arrayModa.push($(this).attr('id'));
		        			});

		        			$('input.others-box').each(function() {
		        				if ($(this).val().length) {
			    					if ($(this).attr('id') === "segmentoOutros") {
			    						arraySegmento.push($(this).attr('id') + ":" + $(this).val());
			    					}

			    					if ($(this).attr('id') === "topOutros") {
			    						arrayTop.push($(this).attr('id') + ":" + $(this).val());
			    					}

			    					if ($(this).attr('id') === "bottomOutros") {
			    						arrayBottom.push($(this).attr('id') + ":" + $(this).val());
			    					}

			    					if ($(this).attr('id') === "homeOutros") {
			    						arrayHome.push($(this).attr('id') + ":" + $(this).val());
			    					}

			    					if ($(this).attr('id') === "baseEstampariaOutros") {
			    						arrayEstamparia.push($(this).attr('id') + ":" + $(this).val());
			    					}

			    					if ($(this).attr('id') === "modaIntimaOutros") {
			    						arrayModa.push($(this).attr('id') + ":" + $(this).val());
			    					}
		        				}
		        			});

		        			setor = $('#setorCalcadista').val();
		        			outraFinalidade = $('#outraFinalidade').val();

							var finalidadeP = {
								Bottom: arrayBottom.join(','),
								Estamparia: arrayEstamparia.join(','),
								Home: arrayHome.join(','),
								Moda: arrayModa.join(','),
								Modelagem: arrayModelagem.join(','),
								OutraFinalidade: outraFinalidade,
								Segmento: arraySegmento.join(','),
								Setor: setor,
								Top: arrayTop.join(','),
								VPNumber: vendapersonalizada.vpData[0].VPNumber
							}

							$.ajax({
								url: 'http://was-dev/Focus24/Services/VP.svc/SalvaFinalidade/0',
								data: JSON.stringify(finalidadeP),
								type: 'POST',
								contentType: "application/json; charset=utf-8",
								traditional: true,
								success: function(data) {console.log(data);vendapersonalizada.navPage();},
							});
						}
					});
	        	});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				});
	        },

		    /**
			    * Load content in `Solicitação de Venda -> Prazo, Preço e Quantidade`
			    * * Used webservices: getVP, getAberracao
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        prazoPrecoQuantidade: function(code) {
	        	var big_obj;
                var self = this;
                vendapersonalizada.setCounter();
	        	$('#amount').mask('00.000.000', {reverse: true});
	        	$('#totalAmount').mask('00.000.000', {reverse: true});
	        	$('#price').mask('000.000.000.000.000,00', {reverse: true}); 
                $('#exportByNaval').prop('checked', true);

	        	$('.fastForm input[type="radio"]').bind("click",function() {
	        		if ($(this).val() === "Yes") {
	        			$(this).parents(".inline").find('input[type="text"]').removeAttr("disabled");
	        			$(this).parents(".inline").find('input[type="date"]').removeAttr("disabled");
	        		} else {
	        			$(this).parents(".inline").find('input[type="text"]').attr("disabled","disabled").val("");
	        			$(this).parents(".inline").find('input[type="date"]').attr("disabled","disabled").val("");
	        		}
	        	});

	        	$('input[name=type]').click(function() {
	        		if ($(this).attr('id') === 'pantone') {
	        			$('.pantoneType').removeClass('hide');
	        		} else {
	        			$('.pantoneType').addClass('hide');
	        			$('input[name=pantoneType]').prop('checked', false);
	        		}
	        	});

	        	if (code !== "new") {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

			        $.getJSON(vpCode + "?callback=?", function (dadosRetorno) {
			        	big_obj = JSON.parse(dadosRetorno);
			        	var retorno = JSON.parse(dadosRetorno)[5];

			        	if (!retorno.length) {
                            return !1;
                        }

                        retorno = JSON.parse(retorno[0].Dados);

			        	//Qtd Colors
			        	retorno[0].colors.split(",").forEach(function(el,index) {
			        		if (el !== "") {
			        			var qtd=retorno[0].qtd.split(",")[index];
			        			var tipoCor = el.split(' | ')[1];
			        			var tipoPantone = el.split(' | ')[2];
			        			el = el.split(' | ')[0];
			        			if (tipoPantone === undefined) {
			        				$(".codes").append('<li><p><span class="w-300">'+el+'</span><span class="w-110">'+qtd+'</span><span>'+tipoCor+'</span></p><input name="colorAmount" type="hidden" value="'+qtd+'" data-color="'+el+' | '+tipoCor+'"><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>')
			        			} else {
			        				$(".codes").append('<li><p><span class="w-300">'+el+'</span><span class="w-110">'+qtd+'</span><span>'+tipoCor+' | '+tipoPantone+'</span></p><input name="colorAmount" type="hidden" value="'+qtd+'" data-color="'+el+' | '+tipoCor+' | '+tipoPantone+'"><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>')
			        			}
			        		}
			        	});
						
			        	$("#totalAmount").val(retorno[0].total);
			        	$("#" + retorno[0].uni).prop("checked",true);

			        	//Price Wished
			        	$(".commercialConditions input[type='text']").each(function() {
			        		$(this).val(retorno[1][$(this).attr("id")]);
			        	});

			        	$("#" + retorno[1].currency).prop("checked",true);
			        	$("#" + retorno[1].uni).prop("checked",true);

			        	//Fast Form
			        	retorno[2].forEach(function(el,index) {
			        		$("#" + el).prop("checked", true);
			        	});

			        	$(".fastForm input[type='text']").each(function(index) {
			        		$(this).val(retorno[3][index]);
			        		if ($(this).val().length) {
			        			$(this).attr('disabled', false);
			        		}
			        	});

			        	action();

			        	// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
						
						var complete = true;

			            if (($('#totalAmount').val() === "0" || $('#totalAmount').val() === "")) {
			                complete = false;
			            }

			            if (!$('.colorsConditions input[type=radio]').is(':checked')) {
			            	complete = false;
			            }

			            $('.commercialConditions input[type=text]').each(function() {
			            	if (!$(this).val().length) {
			            		complete = false;
			            	}
			            });

		            	if ($('.commercialConditions input[type=radio]:checked').length !== 2) {
		                	complete = false;
			            }

			            if ($('.fastForm input[type=radio]:checked').length !== 5) {
		                	complete = false;
			            }

			        	$('.fastForm input[type="radio"]:checked').not('#exportByNaval, #exportByAir').each(function() {
			        		if ($(this).attr("value") === "Yes") {
			        			if (!$(this).parents(".inline").find('input[type="text"]').val().length) {
			        				complete = false;
			        			}
			        		}
			        	});

			            if (complete) {
			                $('.btn.next').removeClass('hide');
			            } else {
			            	$('.btn.next').addClass('hide');
			            }

			            if (complete && $('em').eq(0).text() === "7") {
			                $('.btn.finish').removeClass('hide');
			            } else {
			            	$('.btn.finish').addClass('hide');
			            }
			        });
					vendapersonalizada.vpFinalizada();
	        	}

	        	var _fieldA  = $('#nameCode');
	        	var _fieldB = $('#amount');
	        	var _codes = $('ul.block.codes');

	        	// Adicionar cor
	        	
	        	$('a.btn.addColor').click(function() {
	        		var _fieldC = $('.amountByColor input[type=radio]:checked').attr('value');
	        		var _fieldD = $('.amountByColor input[name=pantoneType]:checked').attr('value');
	        		var _fieldE = $('.amountByColor input[type=radio]:checked').attr('id');
	        		var _fieldCLength = $('.amountByColor input[type=radio]:checked').length;

	        		if (_fieldE !== 'pantone') {
		        		if (_fieldA.val().length && _fieldB.val().length && _fieldCLength) {
		        			if (_fieldD !== undefined) {
			        			_codes.prepend('<li style="display:none"><p><span class="w-300">'+_fieldA.val()+'</span><span class="w-110">'+_fieldB.val()+'</span><span>'+_fieldC+_fieldD+'</span></p><input name="colorAmount" type="hidden" value="'+_fieldB.val()+'" data-color="'+_fieldA.val()+' | '+_fieldC+_fieldD+'"/><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
		        			} else {
			        			_codes.prepend('<li style="display:none"><p><span class="w-300">'+_fieldA.val()+'</span><span class="w-110">'+_fieldB.val()+'</span><span>'+_fieldC+'</span></p><input name="colorAmount" type="hidden" value="'+_fieldB.val()+'" data-color="'+_fieldA.val()+' | '+_fieldC+'"/><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
		        			}
			        		_codes.find('li').fadeIn('slow');
			        		_fieldA.val('');
			        		_fieldB.val('');
			        		$('.amountByColor input[type=radio]').prop('checked', false);
			        		action();
		        		}
		        	} else {
		        		if (_fieldA.val().length && _fieldB.val().length && _fieldCLength && $('.amountByColor input[name=pantoneType]:checked').length) {
		        			if (_fieldD !== undefined) {
			        			_codes.prepend('<li style="display:none"><p><span class="w-300">'+_fieldA.val()+'</span><span class="w-110">'+_fieldB.val()+'</span><span>'+_fieldC+_fieldD+'</span></p><input name="colorAmount" type="hidden" value="'+_fieldB.val()+'" data-color="'+_fieldA.val()+' | '+_fieldC+_fieldD+'"/><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
		        			} else {
			        			_codes.prepend('<li style="display:none"><p><span class="w-300">'+_fieldA.val()+'</span><span class="w-110">'+_fieldB.val()+'</span><span>'+_fieldC+'</span></p><input name="colorAmount" type="hidden" value="'+_fieldB.val()+'" data-color="'+_fieldA.val()+' | '+_fieldC+'"/><a class="ico-circle" href="javascript:void(0);"><i class="fa fa-minus" aria-hidden="true"></i></a></li>');
		        			}
			        		_codes.find('li').fadeIn('slow');
			        		_fieldA.val('');
			        		_fieldB.val('');
			        		$('.amountByColor input[type=radio]').prop('checked', false);
			        		action();
		        		} else {
		                	var modal = new Modal();
		    				modal.open('Atenção!',"Para adicionar esta cor, insira o Nome/Código da Cor, Quantidade e o Tipo de Pantone (TPX ou TC).",!1,!1);
		        		}
		        	}

		        	// Calcula o total de quantidade por cor
	        		
	        		var sum = 0;
	        		$("input[name='colorAmount']").each(function() {
        				var currentVal = $(this).val().split(".").join("")
	        			sum += parseInt(currentVal);
	        		})
	        		$("#totalAmount").val(sum);

	        		if ($('#totalAmount').val().length > 5) {
		        		$('#totalAmount').mask('000.000.000');
		        		$('#totalAmount').mask('000.000.000', {reverse: true});
	        		} else {
		        		$('#totalAmount').mask('00.000.000');
		        		$('#totalAmount').mask('00.000.000', {reverse: true});
	        		}

        			if (!$('#pantone').is(':checked')) {
	        			$('.pantoneType').addClass('hide');
	        		}
	        	});

	        	var action = function() {
	        		_codes.find('a.ico-circle').unbind('click').click(function() {
	        			$(this).closest('li').fadeOut(400,function() {
	        				$(this).remove();
	        				
	        				var sum = 0;

			        		$("input[name='colorAmount']").each(function() {
        						var currentVal = $(this).val().split(".").join("")
			        			sum += parseInt(currentVal);
			        		})

			        		$("#totalAmount").val(sum);

			        		if ($('#totalAmount').val().length > 5) {
				        		$('#totalAmount').mask('000.000.000');
				        		$('#totalAmount').mask('000.000.000', {reverse: true});
			        		} else {
				        		$('#totalAmount').mask('00.000.000');
				        		$('#totalAmount').mask('00.000.000', {reverse: true});
			        		}
	        			});
	        		});
	        	}
	        	action();

	        	// Datepicker para os campos de data
				
				if ($(window).width() >= 1024) {
		        	$('li.w-210 input').datepicker({
						defaultDate: "+1w",
						showAnim: "",
						changeMonth: true,
						changeYear: true,
						numberOfMonths: 1,
						monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
						monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
						dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
						dateFormat:"dd/mm/yy",
					    beforeShow: function (input, inst) {
					        var rect = input.getBoundingClientRect();
					        setTimeout(function () {
						        inst.dpDiv.css({ top: rect.top + 105, left: rect.left + 0 });
						        if (rect.bottom < 678) {
						        	inst.dpDiv.css({ top: rect.top + 405, left: rect.left + 0 })
						        }
					        }, 0);
					    }
					});
		        }

		        // Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
				
				$('input').on('change', function() {
					complete = true;

		            if (($('#totalAmount').val() === "0" || $('#totalAmount').val() === "")) {
		                complete = false;
		            }

		            if (!$('.colorsConditions input[type=radio]').is(':checked')) {
		            	complete = false;
		            }

		            $('.commercialConditions input[type=text]').each(function() {
		            	if (!$(this).val().length) {
		            		complete = false;
		            	}
		            });

	            	if ($('.commercialConditions input[type=radio]:checked').length !== 2) {
	                	complete = false;
		            }

		            if ($('.fastForm input[type=radio]:checked').length !== 5) {
	                	complete = false;
		            }

		        	$('.fastForm input[type="radio"]:checked').not('#exportByNaval, #exportByAir').each(function() {
		        		if ($(this).attr("value") === "Yes") {
		        			if (!$(this).parents(".inline").find('input[type="text"]').val().length) {
		        				complete = false;
		        			}
		        		}
		        	});

		            if (complete) {
		                $('.btn.next').removeClass('hide');
		            } else {
		            	$('.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

				// Se mobile, modifica os campos de data para type date
				
				if ($(window).width() < 1024) {
					$('li.w-210 input').prop('type', 'date');
				}

				$('#exportByAir').click(function() {
                	var modal = new Modal();
    				modal.open('Atenção!',"O frete aéreo é mais caro que o frete marítimo.",!0,!1);
				});

				$('#requiresExclusivityYes').click(function() {
                	var modal = new Modal();
    				modal.open('Atenção!',"Exclusividade concedida por um período máximo de 6 meses a contar da data de entrega da produção.",!0,!1);	
				});

				// Para entrar na tela PPQ, a tela "Necessidade do Cliente" precisa estar preenchida 
	        	
	        	if (!$('a[data-url="solicitacao/base"]').hasClass('checked-tab')) {
	            	var modal = new Modal();
					modal.open('Atenção!','Para preencher esta tela, primeiro complete a tela "Necessidade do Cliente"',!1,vendapersonalizada.goBase);
	        	}

				$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
			        		var date1 = new Date();
		                    var date2 = new Date(''+$("#limitedDateValue").val().slice(3,5)+'-'+$("#limitedDateValue").val().slice(0,2)+'-'+$("#limitedDateValue").val().slice(6,10));
		                    
		                    if (!$("#limitedDateValue").val()) {
		                    	self.savePricePage(code,date1,date2,!1,!1);
		                    } else {
		                    	if (!big_obj[2].Novo) {
		                    		var alter=big_obj[2].Alteracao.split(',')[0];	
		                    	} else {
		                    		if (big_obj[2].Similar) {
		                    			var alter=big_obj[2].Alteracao.split(',')[11];
		                    		} else {
		                    			var alter=big_obj[2].Alteracao.split(',')[3];
		                    		}
		                    	}

		                    	$.get("http://was-dev/Focus24/Services/VP.svc/getAberracao/" + alter + "/" + (Number(big_obj[2].Novo) + 1) + "/2/" + $(".transport input:checked").attr("data-id"), function(a) {
		                            self.savePricePage(code, date1, date2, a, !0);
		                        }).fail(function() {
		                        	var modal = new Modal();
			        				modal.open('Atenção!', "Para calculo de prazo é necessário o preenchimento da coluna guia de Base e todos os campos desta tela.",!0,!1);
		                        });
		                    }
		                }
	                });
	        	});

				$('a.btn.finish').click(function() {
					vendapersonalizada.finalizaVp();
				});

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				});
	        },

		    /**
			    * Calculate the deadline for product delivery. If the wished date isn't viable, return a modal for warning the user 
			    * @param {String} code Return the VP number from URL
			    * @param {String} date1 Current date
			    * @param {String} date2 Date inserted by user in #limitedDateValue field
			    * @param {Boolean} limit Date limit for delivery, taken from `getAberracao` service. Use false in `limit` and `val` if the user don't fill the `#limitedDateValue` field
			    * @param {Boolean} val Use false in `limit` and `val` if the user don't fill the `#limitedDateValue` field
			    * @memberOf VendaPersonalizada#
		    */

	        savePricePage: function(code,date1,date2,limit,val) {
                var timeDiff = Math.abs(date2.getTime() - date1.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)); 
                var self = this;

                if ((isNaN(diffDays) || diffDays < limit) && val) {
                	var modal = new Modal();
	        		modal.open('Atenção!',"A data de entrega desejada é incompatível com o prazo médio estabelecido para esse tipo de artigo.",!0,vendapersonalizada.savePricePageAct);
                } else {
                    vendapersonalizada.savePricePageAct();
                }
            },

		    /**
			    * Save the content of `Solicitação de Venda -> Prazo, Preço e Quantidade`
			    * * Used webservices: SalvaPrazo
			    * @memberOf VendaPersonalizada#
		    */

            savePricePageAct: function() {
            	var code = vendapersonalizada.vpCode;
            	var PPQ_aux = {
                    VPNumber: vendapersonalizada.vpData[0].VPNumber,
                    qtd_estimated:{},
                    price_wished:{},
                    price_radios:[],
                    price_dates:[],
                    price_checks:[],
                }

                //Qtd Estimated
                PPQ_aux.qtd_estimated.qtd = '';
                PPQ_aux.qtd_estimated.colors = '';

                $("input[name='colorAmount']").each(function() {
                    PPQ_aux.qtd_estimated.qtd += $(this).val() + ",";
                    PPQ_aux.qtd_estimated.colors += $(this).attr("data-color") + ",";
                });

                PPQ_aux.qtd_estimated.total = $("#totalAmount").val();
                PPQ_aux.qtd_estimated.uni = $(".colorsConditions input:checked").attr("id");

                //Price Wished
                $(".commercialConditions input[type='text']").each(function() {
                    PPQ_aux.price_wished[$(this).attr("id")] = $(this).val();
                });

                $(".commercialConditions input:checked").each(function() {
                    PPQ_aux.price_wished[$(this).attr("name")] = $(this).attr("id");
                });

                //LastPart form
                $(".fastForm input:checked").each(function() {
                    PPQ_aux.price_radios.push($(this).attr("id"));
                });

                $(".fastForm input[type='text']").each(function() {
                    PPQ_aux.price_dates.push($(this).val());
                });

                $(".fastForm input[type=checkbox]:checked").each(function() {
                    PPQ_aux.price_checks.push($(this).attr("id"));
                })

                var PPQ = {
                    VPNumber: vendapersonalizada.vpData[0].VPNumber,
                    Dados:"["+JSON.stringify(PPQ_aux.qtd_estimated)+","+JSON.stringify(PPQ_aux.price_wished)+","+JSON.stringify(PPQ_aux.price_radios)+","+JSON.stringify(PPQ_aux.price_dates)+","+JSON.stringify(PPQ_aux.price_checks)+"]"
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/SalvaPrazo/0',
                    data: JSON.stringify(PPQ),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {console.log(data);vendapersonalizada.navPage();},
                });
            },

		    /**
			    * Load and write the content in `Solicitação de Venda -> Similaridade`
			    * * Used webservices: getVP, SalvaSimilaridade
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        similaridade: function(code) {
	        	var self = this;
	        	vendapersonalizada.setCounter();
	        	$('#price').mask('000.000.000.000.000,00', {reverse: true});

	        	if (code !== "new") {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

			        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
			        	var retorno = JSON.parse(dadosRetorno)[6];
			        	if (retorno.length) {
			        		var Dados = JSON.parse(retorno[0].Dados);
			        		$(".competitorProduces input").eq(retorno[0].Concorrente).trigger("click");

				        	$(".competitorContainer input[type='text']").each(function(index, el) {
			        			$(this).val(Dados[0][index]);
			        		});

				        	Dados[1].forEach(function(el, index) {
				        		$("#"+el).trigger("click");
				        	});
			        	}

			        	// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
						
						var complete = true;
						if ($('.competitorProduces input[type=radio]:checked').attr('id') === "competitorProducesYes") {
			            	if (!$('#competitorName').val().length) {
			            		complete = false;
			            	}
			            }

			            if ($('#priceVariationYes').is(':checked')) {
				            if ($('.priceChange input[type=checkbox]:checked').length === 0) {
			                	complete = false;
				            }
			            }

			            if (complete && $('.competitorProduces input[type=radio]:checked').length) {
			                $('.btn.next').removeClass('hide');
			            } else {
			            	$('.btn.next').addClass('hide');
			            }

			            if (complete && $('em').eq(0).text() === "7") {
			                $('.btn.finish').removeClass('hide');
			            } else {
			            	$('.btn.finish').addClass('hide');
			            }
			        });
					vendapersonalizada.vpFinalizada();
	        	}

				$('input[name=priceVariation]').click(function() {
					if ($(this).attr('id') === "priceVariationYes") {
						$('.checkbox').removeClass('hide');
					} else {
						$('.checkbox').addClass('hide');
					}
				});

	        	$('body main section form.similaridade > fieldset > .content .competitorProduces input[type=radio]').click(function() {
	        		var _t = $(this);
	        		_t.closest('form').find('.competitorContainer').addClass('hide');

	        		switch($(this).val()) {
	        			case 'yes':
	        				_t.closest('form').find('.competitorContainer').removeClass('hide').find(' > ul:eq(0)').removeClass('hide');
	        				break;
	        			case 'no':
	        				break;
        				case 'unknown':
        					break;
	        		}
	        	});

	        	// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
				
				$('input').on('change', function() {
					complete = true;

		            $('#competitorName').each(function() {
		            	if (!$(this).val().length) {
		            		complete = false;
		            	}
		            });

		            if ($('#priceVariationYes').is(':checked')) {
			            if ($('.priceChange input[type=checkbox]:checked').length === 0) {
		                	complete = false;
			            }
		            }

					if ($('.competitorProduces input[type=radio]:checked').attr('id') !== "competitorProducesYes") {
		            	complete = true;
		            }

		            if (complete) {
		                $('.btn.next').removeClass('hide');
		            } else {
		            	$('.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

				// Verifica se atende todos os requisitos para disponibilizar os botões "Salvar dados" e "Enviar Solicitação de VP"
	        	
	        	$('#competitorName').on('keyup', function() {
		            var complete = true;

		            $('#competitorName').each(function() {
		                if (!$(this).val().length) {
		                    complete = false;
		                }
		            });

		            if (complete) {
		                $('.btn.next').removeClass('hide');
		            } else {
		            	$('.btn.next').addClass('hide');
		            }

		            if (complete && $('em').eq(0).text() === "7") {
		                $('.btn.finish').removeClass('hide');
		            } else {
		            	$('.btn.finish').addClass('hide');
		            }
		        });

	        	$('a.btn.next').click(function() {
		        	vendapersonalizada.getStatus(function(result) {
		        		if (result !== 'REVENDO' && result !== 'ANDAMENTO') {
		        			vendapersonalizada.navPage();
		        		} else {
							if ($('.competitorProduces input[type=radio]:checked').attr('id') !== "competitorProducesYes") {		
								$('input').val('');
								$('input').not('.competitorProduces input[type=radio]').prop('checked', false);
							}

			        		var Similarity_aux = {
								VPNumber: vendapersonalizada.vpData[0].VPNumber,
								inputs:[],
								checks:[],
								Concorrente:1
							}

							Similarity_aux.Concorrente=$(".competitorProduces input:checked").attr("data-tag");

							$(".competitorContainer input[type='text']").each(function() {
								Similarity_aux.inputs.push($(this).val());
							});

							$(".competitorContainer input:checked").each(function() {
								Similarity_aux.checks.push($(this).attr("id"));
							});

							var Similarity = {
								VPNumber: vendapersonalizada.vpData[0].VPNumber,
								Concorrente:Similarity_aux.Concorrente,
								Dados:"["+JSON.stringify(Similarity_aux.inputs)+","+JSON.stringify(Similarity_aux.checks)+"]"
							}

			        		$.ajax({
								url: 'http://was-dev/Focus24/Services/VP.svc/SalvaSimilaridade/0',
								data: JSON.stringify(Similarity),
								type: 'POST',
								contentType: "application/json; charset=utf-8",
								traditional: true,
								success: function(data) {console.log(data); location.reload()},
							});
			        	}
			        });
	        	});

	        	$('a.btn.finish').click(function() {
	        		vendapersonalizada.finalizaVp();
                });

				$('a.btn.prev').click(function() {
					vendapersonalizada.navPagePrev();
				});
	        },

		    /**
			    * Search and list the VPs that are ready for approval
			    * * Used webservices: VpList
			    * @memberOf VendaPersonalizada#
		    */

	        fluxo_inicial: function(just_return) {
	        	var self = this;

	        	// Datepicker para os campos de data
				
				if ($(window).width() >= 1024) {
		        	$("#emissionDate").datepicker({
						defaultDate: "+1w",
						showAnim: "",
						changeMonth: true,
						changeYear: true,
						numberOfMonths: 1,
						monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
						monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
						dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
						dateFormat:"dd/mm/yy",
					    beforeShow: function (input, inst) {
					        var rect = input.getBoundingClientRect();
					        setTimeout(function () {
						        inst.dpDiv.css({ top: rect.top + 50, left: rect.left + 0 });
					        }, 0);
					    }
					});
		        }

		        // Se mobile, modifica os campos de data para type date
				
				if ($(window).width() < 1024) {
					$('#emissionDate').prop('type', 'date');
				}

				// Retorna resultado, considerando os filtros dentro de VPLIST. Resultado será apresentado na tabela

            	$('#search').click(function() {
                    var VPLIST = {
                        Aprovacao: $('#clientName').val(),
                        Cliente: $('#clientName').val(),
                        CodCliente: $('#clientCode').val(),
                        CodRepre: $('#representative').val(),
                        Data: $('#emissionDate').val(),
                        Gestor: $('#manager').val(),
                        Representante: $('#representative').val(),
                        Status: $('#proposalStatus').val(),
                        VPNumber: $('#vpRequest').val(),
                        Departamento:self.usr.Perfil.DescPerfil,
                        Filtro:self.usr.VKBUR,
                        VPCode:"",
                        VPNumberBase: $('#vpRequest').val()
                    }

                    $.ajax({
                        url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                        data: JSON.stringify(VPLIST),
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: function(data) {
                            var retorno = JSON.parse(data);
                            var html = "";

                            if (just_return) {
                            	return retorno;
                            }

			            	retorno.sort(function(a1, a2) {
								return a2.VPNumber - a1.VPNumber;
							});

                            $('ul.attrvalue li, li[class*=Status_], li[class*=Data_]').not('.first').remove();

                            $.each(retorno, function(index, value) {
                                var self = this;
                                var approval = JSON.parse(self.Aprovacao);

                                if (this.Status !== "ANDAMENTO" && this.Status !== "REVENDO") {
	                                $(".attrvalue").each(function(a, b) {
	                                    var class_name = "";

	                                    if (index % 2) {
	                                        class_name = 'odd';
	                                    } else {
	                                        class_name = '';
	                                    }

	                                    class_name += (" " + $(this).attr('name'));
	                                    html = "<li class='"+class_name+"'>";

	                                    if ($(this).attr("link")) {
	                                    	html += "<a title='"+self[$(this).attr("name")]+"' href='"+$(this).attr("link")+self[$(this).attr("name")]+"'>"+self[$(this).attr("name")]+"</a></li>";
	                                    } else {
	                                    	html += (self[$(this).attr("name")] || "-")+"</li>";
	                                    }

	                                    $(this).append(html);
	                                });
									$(".aprovattr").each(function(index,el) {
										var class_name = "";

	                                    if (index % 2) {
	                                        class_name = 'odd';
	                                    } else {
	                                        class_name = '';
	                                    }

	                                    class_name += (" " + $(this).attr('name'));
	                                    html = "<li class='"+class_name+"'>";

	                                    if ($(this).hasClass("seticon")) {
	                                    	$.map(vendapersonalizada.icons, function(val, i) {
			                                    if (parseInt(approval[$(el).attr("name")]) === val.id) {
			                                        html +="<span class='fa "+val.classname+" aria-hidden='true'></span></li></li>";
			                                    }
			                                });
	                                    } else {
	                                    	html += (approval[$(this).attr("name")] || "-")+"</li>";
	                                    }

	                                    $(this).append(html);
									});
                                }
                            });

							$('.VPCode').css('font-size', '0.65em')
							var rowsLength = $('li.VPCode').length;
							$('.totalVp').text('Total de VPs: ' + rowsLength);
                        },
                    });
                });

				$('#clear').click(function() {
					$('div.content div input[type=text], div.content div select, div.content div input[type=date]').val('');
				})

                $('main nav > ul li ul li').removeClass('active');

                $('main div.table h2 i').click(function() {
                    if ($(this).hasClass('fa-lock')) {
                        $(this).removeClass('fa-lock').addClass('fa-unlock');
                    } else {
                        $(this).removeClass('fa-unlock').addClass('fa-lock');
                    }
                });

                $('main div.table dl dd ul li').click(function() {
                    $('main div.table dl dd ul li').removeClass('hover');

                    if (vendapersonalizada.wSize() <= 990) {
                        _vp = $('main div.table .solicitacao dl.w-25 dd ul:nth-child(1) li:nth-child('+($(this).index()+1)+') a');
                        _de = $('main div.table .solicitacao dl.w-25 dd ul:nth-child(2) li:nth-child('+($(this).index()+1)+')');
                        _cod = $('main div.table .solicitacao dl.w-30 dd ul:nth-child(1) li:nth-child('+($(this).index()+1)+')');
                        if (!_vp.html()) return;
                        $('p.vp_info').html('<strong>VP:</strong> '+_vp.html()+'<br><strong>Data Emissão:</strong> '+_de.html()+'<br><strong>Código:</strong> '+_cod.html());
                    }
                });

                $('main div.table dl dd ul li a').click(function() {
                    $('nav ul.disabled').removeClass('disabled').find('li:first-child').addClass('active');
                    vendapersonalizada.loader(1);
                    vendapersonalizada.load('fluxo/resumo');
                });

                if (vendapersonalizada.wSize() > 991) {
                    _div = $('main div.table > div > div');
                    _div.click(function() {
                        
                        _div.removeClass('tbl-move');
 
	                    if ($(this).hasClass('hover')) {
	                        if (_tbl_class=='tbl-container-01') {$('.tbl-container-01').toggleClass('hover');}
	                        if (_tbl_class=='tbl-container-02') {$('.tbl-container-02').toggleClass('hover');}
	                        if (_tbl_class=='tbl-container-03') {$('.tbl-container-03').toggleClass('hover');}
                            return;
                        }
                        _div.removeClass('hover');

                        /* Move table */
                        _tbl_class = $(this).attr('class');
                        if (_tbl_class=='tbl-container-01') {
                            $('main div.table div.tbl-container-02, main div.table div.tbl-container-03').addClass('tbl-move');
                            $('.tbl-container-01').toggleClass('hover');
                        }

                        if (_tbl_class=='tbl-container-02') {
                            $('main div.table div.tbl-container-03').addClass('tbl-move');
                            $('.tbl-container-02').toggleClass('hover');
                        }

                        if (_tbl_class=='tbl-container-03') {
                            $('main div.table div.tbl-container-01').addClass('tbl-move');
                            $('.tbl-container-03').toggleClass('hover');
                        }
 
 
                        $(this).addClass('hover');
                    }); 
                    $(document).mouseup(function (e) {
                        var container = $("main div.table");

                        if (!container.is(e.target) // if the target of the click isn't the container...
                            && container.has(e.target).length === 0) // ... nor a descendant of the container
                        {
                            _div.removeClass('hover').removeClass('tbl-move');
                        }
                    });
                }
            },

		    /**
			    * Show a summary of VP from `Solicitação de Venda`
			    * * Used webservices: getVP
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        fluxo_resumo: function(code) {
	        	$('nav ul.disabled').removeClass('disabled').find('li:first-child').addClass('active');
	        	
	        	// Popula tela de resumo

	        	if (!vendapersonalizada.vpData.length) {
	        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

	                $.getJSON( vpCode + "?callback=?", function (dadosRetorno) {
	                    try {
	                        vendapersonalizada.vpData = JSON.parse(dadosRetorno);
	                        $(".writter_container").each(function(index, el) {
	                        	switch($(el).attr("name"))
	                        	{
	                        		case "Dados":
	                        			var name = $(el).find("dl").attr("name");
			                        	$(el).find(".writter_item").each(function(a, b) {
			                        		$(b).text(vendapersonalizada.vpData[index][$(b).attr("name")]);
			                        	});
	                        		break;
	                        		case "Segmentacao":
	                        			var segmentData = vendapersonalizada.vpData[1];
	                        			var json = vendapersonalizada.vpData[1].Opcoes.split(',');

	                        			if (segmentData.CompraFocus === true) {
	                        				$('.buyFocus').append('Sim');
	                        				for (i = 0; i < json.length; i++) {
		                        				$('div.segmentacao label').each(function() {
		                        					if ($(this).attr('for') === json[i]) {
		                        						$(this).removeClass('hide');
		                        						$(this).after('<br>');
		                        					}
		                        				});
		                        			}
	                        			}

	                        			if (segmentData.CompraFocus === false) {
	                        				$('.buyFocus').append('Não');
	                        				$('.companySize').removeClass('hide');

	                        				if (segmentData.GrandePorte === true) {
	                        					$('[for=grandePorte]').removeClass('hide');
	                        					$('[for=grandePorte]').after('<br><br>');
	                        				} else {
	                        					$('[for=pequenoPorte]').removeClass('hide');
	                        					$('[for=pequenoPorte]').after('<br><br>');

	                        				}

	                        				for (i = 0; i < json.length; i++) {
		                        				$('div.segmentacao label').each(function() {
		                        					if ($(this).attr('for') === json[i]) {
		                        						$(this).removeClass('hide');
		                        						$(this).after('<br>');
		                        					}
		                        				});
		                        			}
	                        			}
	                        		break;
	                        		case "Base":
	                        			var baseData = vendapersonalizada.vpData[2];
	                        			var json = vendapersonalizada.vpData[2].Alteracao.split(',');

	                        			if (baseData.Novo === false) {
	                        				$('.exist.hide').removeClass('hide');
	                        				$('.existBase').append(json[4]);
	                        				$('#existBaseSku').append(json[2]);	

	                        				for (i = 0; i < json.length; i++) {
		                        				$('.existBaseBoxes label').each(function() {
		                        					if ($(this).attr('for') === json[i]) {
		                        						$(this).removeClass('hide');
		                        						$(this).after('<br>');
		                        					}
		                        				});
		                        			}
	                        			}

	                        			if (baseData.Novo === true) {
	                        				if (baseData.Similar === true) {
	                        					$('.similar.hide').removeClass('hide');
			            						var specify = baseData.Alteracao.split('- ')[1].split(',')[0];
	                        					$('#sku').append(baseData.CodigoAmostra + ' - ' + specify);

		                        				for (i = 0; i < json.length; i++) {
		                        					var splitedData = json[i].split(':');
			                        				$('.similar dd, .similar li').each(function() {
			                        					if ($(this).attr('id') === splitedData[0]) {
			                        						$(this).append(splitedData[1]);
			                        						$(this).after('<br>');
			                        					}
			                        				});
			                        			}

								            	if (json[9].split(':')[0] === 'nec' && $('#grammageA').text().length) {
								            		$('#grammageA').append(' g/m2');
								            	} else if (json[9].split(':')[0] === 'nec2' && $('#grammageA').text().length) {
								            		$('#grammageA').append(' g/m');
								            	} else {
								            		$('#grammageA').append('-');
								            	}
	                        				}

	                        				if (baseData.Similar === false) {
	                        					$('.totalNew.hide').removeClass('hide');

		                        				for (i = 0; i < json.length; i++) {
		                        					var splitedData = json[i].split(':');

			                        				$('.totalNew label').each(function() {
			                        					if ($(this).attr('for') === json[i]) {
			                        						$(this).removeClass('hide');
			                        						$(this).after('<br>');
			                        					}
			                        				});

			                        				if (splitedData[0] === "others") {
			                        					$('.totalNew #others').append(splitedData[1]);
			                        				}

													if (splitedData[0] === "specify") {
				                        				if ($('[for=outros]').not('.hide').length) {
 				                        					$('[for=outros]').text(splitedData[1]);
				                        				}
			                        				}
			                        			}
	                        				}
	                        			}
	                        		break;
	                        		case "Amostra":
	                        			if (vendapersonalizada.vpData[3][0].Tipo === 'sampleNo') {
	                        				$('#noSample').removeClass('hide');
	                        				$('.hasSample').remove();
	                        			} else {
	                        				var sampleLength = vendapersonalizada.vpData[3].length;

		                        			for (i = 0; i < sampleLength; i++) {
			                        			$('#codigoAmostra').append('<li><p class="codigoAmostra" value="' + vendapersonalizada.vpData[3][i].CodAmostra + '">VP ' + vendapersonalizada.vpCode + ' - AMOSTRA ' + vendapersonalizada.vpData[3][i].CodAmostra) + '</p><a id="removeSample" title="Excluir" sample="' + vendapersonalizada.vpData[3][i].CodAmostra + '"class="ico-circle right" href="javascript:void(0);"><i class="fa fa-trash" aria-hidden="true"></i></a></li>';
		                        			}

		                        			$('.codigoAmostra').click(function() {
			                        			for (i = 0; i < sampleLength; i++) {
				                        			var currentSample = $(this).attr('value') - 1;
				                        			var json = (vendapersonalizada.vpData[3][currentSample].Tipo + "," + vendapersonalizada.vpData[3][currentSample].Tipo2).split(',');
													var splitImg = vendapersonalizada.vpData[3][currentSample].Tipo.split("'");
													var decodedImg = splitImg[1];
				                        			var sampleData = vendapersonalizada.vpData[3][currentSample];
			                        				$('.form.amostra').children().remove();
			                        				$('.form.amostra').append('<li id="codigoAmostra" class="answer"></li><li class="hide"><div class=""><input id="roupaConfeccionada" class="hide" type="checkbox" disabled><label for="roupaConfeccionada">Roupa confeccionada</label></div><p class="answer"><a href="javascript:void(0);"><img id="imgAmostra3" src="" width="180" height="180"></a></p></li><br><li class="hide"><div class=""><input id="amostraTecido" class="hide" type="checkbox" disabled><label for="amostraTecido">Amostra física de tecido</label></div><p class="answer"><a href="javascript:void(0);"><img id="imgAmostra4" src="" width="180" height="180"></a></p></li><br><li class="hide"><div class=""><input id="catalogoFoto" class="hide" type="checkbox" disabled><label for="catalogoFoto">Catálogo / Foto</label></div><p class="answer"><a href="javascript:void(0);"><img id="imgAmostra" src="" width="180" height="180"></a></p></li><br><li class="hide"><div class=""><input id="amostraEstampa" class="hide" type="checkbox" disabled><label for="amostraEstampa">Amostra de Estampa / Desenho de Estúdio</label></div><p class="answer"><a href="javascript:void(0);"><img id="imgAmostra2" src="" width="180" height="180"></a></p></li><br><li class="hide"><div class=""><input id="pantone" class="hide" type="checkbox" disabled><label for="pantone">Pantone | </label></div><p id="pantoneCode" class="answer"></p></li><p class="subtitle">Outros (Especificar)</p><p id="others" class="answer"></p><p class="subtitle">É necessária a devolução?</p><p class="answer giveBack"></p><p class="subtitle">Pode ser cortada?</p><p class="answer couldBeCut"></p>');
			                        				
			                        				for (x = 0; x < json.length; x++) {
			                        					var splitedData = json[x].split(':');

			                        					$('div[name=Amostra] input[type=checkbox]').each(function() {
				                        					if ($(this).attr('id') === splitedData[0]) {
				                        						$(this).parents('li').removeClass('hide');
				                        					}
			                        					});

			                        					if ($('#catalogoFoto').parents('li.hide').length === 0) {
			                        						$('#imgAmostra').attr('src', decodedImg);
			                        					}

			                        					if ($('#amostraEstampa').parents('li.hide').length === 0) {
			                        						$('#imgAmostra2').attr('src', decodedImg);
			                        					}

			                        					if ($('#roupaConfeccionada').parents('li.hide').length === 0) {
			                        						if (decodedImg === undefined) {
			                        							$('img#imgAmostra3').remove()
			                        						} else {
			                        							$('#imgAmostra3').attr('src', decodedImg);
			                        						}
			                        					}

			                        					if ($('#amostraTecido').parents('li.hide').length === 0) {
			                        						if (decodedImg === undefined) {
			                        							$('img#imgAmostra4').remove()
			                        						} else {
			                        							$('#imgAmostra4').attr('src', decodedImg);
			                        						}
			                        					}

			                        					if (splitedData[0] === 'tpx') {
			                        						$('[for=pantone]').append(splitedData[1] + ' (Papel)');
			                        					}

			                        					if (splitedData[0] === 'tc') {
			                        						$('[for=pantone]').append(splitedData[1] + ' (Tecido)');
			                        					}

			                        					if (splitedData[0] === 'pantoneCode') {
			                        						$('#pantoneCode').append('Código: ' + splitedData[1] + '<br>');
			                        					}

			                        					if (splitedData[0] === 'others') {
			                        						$('.amostra #others').append(splitedData[1]);
			                        					}
				                        			}
				                        			$('li.hide').next('br').remove();

				                        			if (!$('.amostra #others').text().length) {
				                        				$('.amostra #others').prev().remove();
				                        			}

				                        			if (sampleData.Devolucao === true) {
				                        				$('.giveBack').append('Sim');
				                        			} else {
				                        				$('.giveBack').append('Não');
				                        			}

				                        			if (sampleData.Corte === true) {
				                        				$('.couldBeCut').append('Sim');
				                        			} else {
				                        				$('.couldBeCut').append('Não');
				                        			}
			                        			}
		                        			});
										}
	                        		break;
	                        		case "finalidadeProduto":
	                        			var retorno = vendapersonalizada.vpData[4][0];
										var array = ((retorno.Segmento) + "," + (retorno.Modelagem) + "," + (retorno.Top) + "," + (retorno.Bottom) + "," + (retorno.Home) + "," + (retorno.Estamparia) + "," + (retorno.Moda));
						            	array = array.split(',');

						            	for (i = 0; i < array.length; i++) {
						            		splitedData = array[i].split(':');

							            	$('div.finalidade_produto label').each(function() {
							            		if ($(this).attr('for') === array[i]) {
							            			$(this).removeClass('hide');
							            			$(this).parents('ul').removeClass('hide');
							            			$(this).after('<br>');
							            		}
						        			});

						        			if (splitedData[0] === 'segmentoOutros') {
						        				$('[for=segmentoOutros]').removeClass('hide');
						        				$('[for=segmentoOutros]').parents('ul').removeClass('hide');
						        				$('[for=segmentoOutros]').append(splitedData[1]);
						        			}

						        			if (splitedData[0] === 'topOutros') {
						        				$('[for=topOutros]').removeClass('hide');
						        				$('[for=topOutros]').parents('ul').removeClass('hide');
						        				$('[for=topOutros]').append(splitedData[1]);
						        			}

						        			if (splitedData[0] === 'bottomOutros') {
						        				$('[for=bottomOutros]').removeClass('hide');
						        				$('[for=bottomOutros]').parents('ul').removeClass('hide');
						        				$('[for=bottomOutros]').append(splitedData[1]);
						        			}

						        			if (splitedData[0] === 'homeOutros') {
						        				$('[for=homeOutros]').removeClass('hide');
						        				$('[for=homeOutros]').parents('ul').removeClass('hide');
						        				$('[for=homeOutros]').append(splitedData[1]);
						        			}

						        			if (splitedData[0] === 'baseEstampariaOutros') {
						        				$('[for=baseEstampariaOutros]').removeClass('hide');
						        				$('[for=baseEstampariaOutros]').parents('ul').removeClass('hide');
						        				$('[for=baseEstampariaOutros]').append(splitedData[1]);
						        			}

						        			if (splitedData[0] === 'modaIntimaOutros') {
						        				$('[for=modaIntimaOutros]').removeClass('hide');
						        				$('[for=modaIntimaOutros]').parents('ul').removeClass('hide');
						        				$('[for=modaIntimaOutros]').append(splitedData[1]);
						        			}
						            	}

					            		if (retorno.Setor.length) {
					            			$('#setorCalcadista').append(retorno.Setor);
					            			$('#setorCalcadista').removeClass('hide');
					            			$('#setorCalcadista').parents('ul').removeClass('hide');
					            			$('#setorCalcadista').after('<br>');
					            		}

					            		if (retorno.OutraFinalidade.length) {
					            			$('#outraFinalidade').append(retorno.OutraFinalidade);
					            			$('#outraFinalidade').removeClass('hide');
					            			$('#outraFinalidade').parents('ul').removeClass('hide');
					            			$('#outraFinalidade').after('<br>');
					            		}
	                        		break;
	                        		case "prazoPrecoQuantidade":
	                        			var json = JSON.parse(vendapersonalizada.vpData[5][0].Dados);
	                        			var colors = (json[0].colors).split(',');
	                        			var qtd = (json[0].qtd).split(',');

	                        			if (json[0].uni === "amountMetros") {
	                        				$('#totalAmount').append(json[0].total + ' Metros');
	                        			} else {
	                        				$('#totalAmount').append(json[0].total + ' Quilos');
	                        			}

	                        			for (i = 0; i < colors.length; i++) {
	                        				var current = colors[i].split(' | ');
	                        				$('#colors').append('<dd>' + current[0] + '</dd>');
	                        			}

	                        			for (i = 0; i < qtd.length; i++) {
	                        				$('#colorAmount').append('<dd>' + qtd[i] + '</dd>');
	                        			}

	                        			for (i = 0; i < colors.length; i++) {
	                        				var current = colors[i].split(' | ');
	                        				if (current !== undefined && current[0].length) {
	                        					if (current[2] !== undefined) {
	                        						$('#colorType').append('<dd>' + current[1] + ' | ' + current[2] + '</dd>');
	                        					} else {
	                        						$('#colorType').append('<dd>' + current[1] + '</dd>');
	                        					}
	                        				}
	                        			}

	                        			if (json[1].currency === 'currencyReal') {
	                        				if (json[1].uni === 'byMetros') {
	                        					$('#price').append('R$ ' + json[1].price + ' por Metro');
	                        				}
	                        				if (json[1].uni === 'byKilos') {
	                        					$('#price').append('R$ ' + json[1].price + ' por Quilo');
	                        				}
	                        			}

	                        			if (json[1].currency === 'currencyDolar') {
	                        				if (json[1].uni === 'byMetros') {
	                        					$('#price').append('US$ ' + json[1].price + ' por Metro');
	                        				}
	                        				if (json[1].uni === 'byKilos') {
	                        					$('#price').append('US$ ' + json[1].price + ' por Quilo');
	                        				}
	                        			}

	                        			$('#width2').append(json[1].width);

	                        			if (json[2][1] === "limitedDateYes") {
	                        				$('#limitedDate').append('Sim');
	                        				$('#limitedDateValue').append(json[3][0]);
	                        			} else {
	                        				$('#limitedDate').append('Não');
	                        				$('#limitedDateValue').append('-');
	                        			}

	                        			if (json[2][2] === "hasCutYes") {
	                        				$('#hasCut').append('Sim');
	                        				$('#hasCutDate').append(json[3][1]);
	                        			} else {
	                        				$('#hasCut').append('Não');
	                        				$('#hasCutDate').append('-');
	                        			}

	                        			if (json[2][3] === "needShowcaseYes") {
	                        				$('#needShowcase').append('Sim');
	                        				$('#needShowcaseDate').append(json[3][2]);
	                        			} else {
	                        				$('#needShowcase').append('Não');
	                        				$('#needShowcaseDate').append('-');
	                        			}

	                        			if (json[2][4] === "requiresExclusivityYes") {
	                        				$('#requiresExclusivity').append('Sim');
	                        				if (json[2][5] === "exclusivityBase" || json[2][6] === "exclusivityColor") {
	                        					$('#requiresExclusivity').append(' / Base');
	                        				}
	                        				if (json[2][5] === "exclusivityColor" || json[2][6] === "exclusivityColor") {
	                        					$('#requiresExclusivity').append(' / Cor');
	                        				}
	                        				if (json[2][5] === "exclusivityStamp" || json[2][6] === "exclusivityStamp" || json[2][7] === "exclusivityStamp") {
	                        					$('#requiresExclusivity').append(' / Estampa');
	                        				}
	                        				$('#requiresExclusivityDate').append(json[3][3]);
	                        			} else {
	                        				$('#requiresExclusivity').append('Não');
	                        				$('#requiresExclusivityDate').append('-');
	                        			}

	                        			if (json[2][0] === "exportByAir") {
	                        				$('#exportBy').append('Aéreo');
	                        			} else {
	                        				$('#exportBy').append('Marítimo');
	                        			}
	                        		break;
	                        		case "Similaridade":
	                        			var json = JSON.parse(vendapersonalizada.vpData[6][0].Dados);
	                        			var competitor = vendapersonalizada.vpData[6][0].Concorrente;

	                        			if (competitor === 0) {
	                        				$('.competitor').append('Sim');
	                        				$('.competitorYes').removeClass('hide');

	                        				for (i = 0; i < json[1].length; i++) {
		                        				$('.priceVariation label').each(function() {
		                        					if ($(this).attr('for') === json[1][i]) {
		                        						$(this).removeClass('hide');
		                        						$(this).after('<br>');
		                        					}
		                        				});
		                        			}

		                        			if ($('li.priceVariation label').not('.hide').length) {
		                        				$('p.priceVariation').append('Sim');
		                        			} else {
		                        				$('p.priceVariation').append('Não');
		                        			}
	                        			}

	                        			if (competitor === 1) {
	                        				$('.competitor').append('Não');
	                        			}

	                        			if (competitor === 2) {
	                        				$('.competitor').append('Desconheço');
	                        			}

	                        			$(el).find(".array_writter").each(function(index,el) {
	                        				var pos=$(el).attr("data-pos");

	                        				$(el).find(".array_item").each(function(a,b) {
	                        					$(this).text(json[pos][parseInt($(this).attr("data-index"))]);
	                        				});
	                        			});

	                        			if (json[1][0] === 'nec') {
	                        				$('[data-index=4]').append(' g/m2');
	                        			} else {
	                        				$('[data-index=4]').append(' g/m')
	                        			}

	                        			$('dd[data-index=3]').append(' cm');
	                        			$('[data-index=5]').append(' m/kg');
	                        			$('[data-index=8]').append('%');

										$('.competitorYes dd span').each(function() {
											if ($(this).text() === 'currencyReal') {
												$(this).text('');
												$('[data-index=6]').prepend('R$')
											}

											if ($(this).text() === 'currencyDolar') {
												$(this).text('');
												$('[data-index=6]').prepend('US$')
											}

											if ($(this).text() === 'byMetros') {
												$(this).text('');
												$('[data-index=6]').append(' / Metro')
											}

											if ($(this).text() === 'byKilos') {
												$(this).text('');
												$('[data-index=6]').append(' / Quilo')
											}

											if ($(this).text() === 'liso') {
												$(this).text('Liso');
											}

											if ($(this).text() === 'estampado') {
												$(this).text('Estampado');
											}

											if ($(this).text() === 'fioTinto') {
												$(this).text('Fio Tinto');
											}
										});

                        				if ($('span[data-index=0]').text() === "R$") {
                        					$('[data-index=7]').text("R$ " + $('[data-index=7]').text());
                        				}

                        				if ($('span[data-index=0]').text() === "US$") {
                        					$('[data-index=7]').text("US$ " + $('[data-index=7]').text());
                        				}

                        				$('span[data-index=0]').remove();
	                        			$('[for]').not('.hide').css('float', 'left');
	                        			$('[for].hide').remove();
	                        		break;
	                        	}
	                        });
	                        vendapersonalizada.setIconsWorkFlow(!1,code);
	                    } catch (ex) {}
	                });
	        	} else {
                    vendapersonalizada.setIconsWorkFlow(!1,code);
	        	}

	        	$(".close").click(function() {
                    window.location.href="#/fluxo";
                });
	        },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Comercial Gerência`
			    * * Used webservices: VpList, getVP
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	      	comercial_g: function(code) {
		      	$("#clientSince").hide();
	        	vendapersonalizada.vpListWriter(code);

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $('#evaluationDate').append(retornoData.Data_Comercial);
                    },
                });

                $('#clientSince').mask('00/00/0000');

	        	$('input[name=feedback]').on('change', function() {
	        		if ($(this).attr('id') !== "feedbackYes") {
	        			$('textarea').attr('placeholder', 'Preencha este campo...');
	        			$('textarea').show();
	        			if (!$('textarea').val().length) {
	        			}
	        		} else {
	        			$('textarea').attr('placeholder', '');
	        		}
	        	});

	        	$('input[name=cancelRisc]').click(function() {
	        		if ($(this).attr('id') === 'cancelRiscYes') {
	        			$('.needPay').removeClass('hide');
	        		} else {
	        			$('.needPay').addClass('hide');
	        			$('input[name=needPay]').prop('checked', false);
	        		}
	        	});

	        	$("#needPayOther").on('keyup', function() {
				   $('#sign2 input:checked').attr('checked', false);
				});

        		$('input[name=needPay]').click(function() {
        			$('#needPayOther').val('');
        		});

        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		        	var retorno = JSON.parse(dadosRetorno)[2].Alteracao.split(',');
		        	$("#clientSince").val(JSON.parse(dadosRetorno)[0].Desde).fadeIn();
		        	$("#alreadyCancelVp"+JSON.parse(dadosRetorno)[0].TemVPCancelada.toString()).attr('checked', true).fadeIn();

		        	if (retorno[0] === 'estampado') {
		        		$('.fidelityEstamp').removeClass('hide');
		        	}

		        	if (retorno[11] === 'Estampado') {
		        		$('.fidelityEstamp').removeClass('hide');
		        	}

		        	if (retorno[1] === 'estampado2') {
		        		$('.fidelityEstamp').removeClass('hide');
		        	}

		        	if (retorno[0] === 'tinto') {
		        		$('.fidelityColor').removeClass('hide');
		        	}

		        	if (retorno[11] === 'Tinto') {
		        		$('.fidelityColor').removeClass('hide');
		        	}
		        	if (retorno[1] === 'tinto2') {
		        		$('.fidelityColor').removeClass('hide');
		        	}

		        	if (retorno[0] === 'fio_tinto') {
		        		$('.fidelityColor').removeClass('hide');
		        	}

		        	if (retorno[11] === 'Fio Tinto') {
		        		$('.fidelityColor').removeClass('hide');
		        	}

		        	if (retorno[1] === 'fio_tinto2') {
		        		$('.fidelityColor').removeClass('hide');
		        	}
		        });
	        	$(".save_button").click(function() {
	        		$('p,b').removeClass('red-alert');

	        		var complete = true;
    				if ($('#cancel-bill input:checked').length < 1) {
        				$('.cancel-bill b ,.cancel-bill').addClass('red-alert');
        				complete = false;
        			}

        			if ($('#sign	input:checked').length < 1) {
        				$('.sign b, .sign').addClass('red-alert');
        				complete = false;
    				}

        			if ($('#sign input:checked').attr('id') === 'cancelRiscYes') {
	        			if ($('#sign2 input:checked').length < 1 && !$('#needPayOther').val().length) {
	    					$('.sign b, .sign').addClass('red-alert');
	    					complete = false;
	    				}
        			}

        			if (!$('.fidelityColor').is('.hide')) {
	    				if ($('#color input:checked').length < 1) {
	        				$('.color b, .color').addClass('red-alert');
	        				complete = false;
	    				}
        			}

        			if (!$('.fidelityEstamp').is('.hide')) {
	    				if ($('#print input:checked').length < 1) {
	        				$('.print b, .print').addClass('red-alert');
	        				complete = false;
	    				}
	    			}

    				if ($('#vp input:checked').length < 1 || !$('#clientSince').val().length) {
	    				$('.vp b, .vp').addClass('red-alert');
	    				complete = false;
    				}

    				if ($('#gc input:checked').length < 1) {
    					$('.gc b, .gc').addClass('red-alert');
	    				complete = false;
    				}

	        		if ($('input[name=feedback]:checked').attr('id') !== "feedbackYes" && !$('textarea').val().length) {
	        			$('.gc b, .gc').addClass('red-alert');
	        			complete = false;
	        		}

	        		if (!$('#caracteristic input:checked').length) {
    					$('.caracteristic b, .caracteristic').addClass('red-alert');
    					complete = false;
    				}

	        		if (complete) {
	        			vendapersonalizada.saverWorkFlow(code);
	        		}
	        	});

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove();
				}

	        	$(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
	        },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Comercial Diretoria`
			    * * Used webservices: VpList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        comercial_d: function(code) {
                vendapersonalizada.vpListWriter(code);

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $('#evaluationDate').append(retornoData.Data_Diretoria_Comercial);
                    },
                });

	        	$('input[name=feedback]').on('change', function() {
	        		if ($(this).attr('id') !== "feedbackYes") {
	        			$('textarea').attr('placeholder', 'Preencha este campo...');
	        			$('textarea').show();
	        			if (!$('textarea').val().length) {
	        			}
	        		} else {
	        			$('textarea').attr('placeholder', '');
	        		}
	        	});

                $(".save_button").click(function() {
                	if ($(".no_latbars li a[name='Status_Comercial'] span").hasClass("waiting")) {
                		var modal=new Modal();
	        			modal.open('Ação não realizada!',"É necessária a avaliação do Gestor Comercial.",!0,!1);
	        			return !1;
                	}
                	$('p,b').removeClass('red-alert');

                	if ($('#dc input:checked').length < 1) {
    					$('.dc b, .dc').addClass('red-alert');
    				};

    				if ($('input[name=feedback]:checked').attr('id') !== "feedbackYes") {
	        			if ($('textarea').val()=='') {
	        				$('textarea').attr('placeholder', 'Preencha este campo...');
	        				$('.dc b, .dc').addClass('red-alert');
	        			} else {
	        				$('textarea').attr('placeholder', '');
		        			vendapersonalizada.saverWorkFlow(code);
		        		}
	        		} else {
	        			vendapersonalizada.saverWorkFlow(code);
	        		};
                    
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove()
				}

                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/" + vendapersonalizada.vpCode;
                });
 
            },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Produto`
			    * * Used webservices: VpList, getVP
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

            produto: function(code) {
                vendapersonalizada.vpListWriter(code);

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $('#evaluationDate').append(retornoData.Data_Projetos_Especiais);
                    },
                });

                // Se essa VP em "Necessidade do Cliente" for "Base Existente", carrega o código do artigo. Se não, abre os campos para preenchimento

                var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (retorno) {
		        	var data = JSON.parse(retorno);
		        	if (data[2].Novo) {
		        		$('.newBase').removeClass('hide');
		        		
		        		if (data[2].Similar) {
		        			$('#baseTitle').append(' Base Nova - Similar');
		        		} else {
		        			$('#baseTitle').append(' Base Nova - Totalmente Nova');
		        		}
		        	} else {
		        		data = data[2].Alteracao.split(',');
		        		$('.existBase').removeClass('hide');
		        		$('#itemCodeExist').val(data[2]);
		        		$('input[name=colorRadio]').each(function() {
		        			if ($(this).attr('id') === data[0]) {
		        				$(this).prop('checked', true);
		        			}
		        		});
		        	}
		        });

	        	$('input[name=feedback]').on('change', function() {
	        		if ($(this).attr('id') !== "feedbackYes") {
	        			$('textarea').attr('placeholder', 'Preencha este campo...');
	        			$('textarea').show();
	        			if (!$('textarea').val().length) {
	        			}
	        		} else {
	        			$('textarea').attr('placeholder', '');
	        		}
	        	});

                $(".save_button").click(function() {
                	$('p,b').removeClass('red-alert');
                	var complete = true;

                	if (!$('input[name=feedback]:checked').length) {
    					$('.gp b, .gp').addClass('red-alert');
    					complete = false;
    				}


    				if ($('input[name=feedback]:checked').attr('id') !== "feedbackYes") {
	        			if (!$('textarea').val().length) {
	        				$('textarea').attr('placeholder', 'Preencha este campo...');
	        				$('.gp b, .gp').addClass('red-alert');
	        				complete = false;
	        			}
	        		}

	        		if($('.newBase').not('.hide').length) {
						if (!$('input[name=nameRadio]:checked').length) {
	    					$('#baseTitle').addClass('red-alert');
	    					complete = false;
	    				}
	        		}

	        		$('input[type=text]').each(function() {
	        			if ($('.newBase').not('.hide').length) {
		        			if ($(this).attr('id') !== 'itemCodeExist') {
			        			if (!$(this).val().length) {
			        				$(this).attr('placeholder', 'Preencha este campo...');
			        				$('.gp b, .gp').addClass('red-alert');
			        				complete = false;
			        			}
		        			}
		        		}
		        		
		        		if ($('.existBase').not('.hide').length) {
		        			if ($(this).attr('id') === 'itemCodeExist') {
			        			if (!$(this).val().length) {
			        				$(this).attr('placeholder', 'Preencha este campo...');
			        				$('.gp b, .gp').addClass('red-alert');
			        				complete = false;
			        			}
		        			}
		        		}
	        		});

	        		if (complete) {
	        			vendapersonalizada.saverWorkFlow(code);
	        		};
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove()
				}

                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
            },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Supply Chain`
			    * * Used webservices: VpList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

            supply_chain: function(code) {
                vendapersonalizada.vpListWriter(code);

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $('#evaluationDate').append(retornoData.Data_Supply_Chain);
                    },
                });

	        	$('input[name=feedback]').on('change', function() {
	        		if ($(this).attr('id') !== "feedbackYes") {
	        			$('textarea').attr('placeholder', 'Preencha este campo...');
	        			$('textarea').show();
	        			if (!$('textarea').val().length) {
	        			}
	        		} else {
	        			$('textarea').attr('placeholder', '');
	        		}
	        	});

                $(".save_button").click(function() {
                	$('p,b').removeClass('red-alert');
                	if ($('#suply input:checked').length < 1) {
    					$('.suply b, .suply').addClass('red-alert');
    				}
    				if ($('input[name=feedback]:checked').attr('id') !== "feedbackYes") {
	        			if ($('textarea').val()=='') {
	        				$('textarea').attr('placeholder', 'Preencha este campo...');
	        				$('.suply b, .suply').addClass('red-alert');
	        			} else {
		        			vendapersonalizada.saverWorkFlow(code);
		        		}
	        		} else {
	        			vendapersonalizada.saverWorkFlow(code);
	        		};
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove()
				}

                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
            },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Financeiro Custos`
			    * * Used webservices: VpList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

            financeiro_cus: function(code) {
                vendapersonalizada.vpListWriter(code);
                var perfil=this.usr.Perfil.DescPerfil;

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $('#evaluationDate').append(retornoData.Data_Financeiro_Custos);
                    },
                });
	        	$('#itemPrice').mask('000.000.000.000.000,00', {reverse: true});

	        	// Multiplica o Preço do artigo * Quantidade total

                $('#totalAmount, #itemPrice').on('keyup', function() {
	        		$('#totalAmount').mask('00.000.000', {reverse: true});
	        		itemPrice = $('#itemPrice').val().split(".").join("");
	        		itemPrice = itemPrice.split(",").join("");
	        		totalAmount = $('#totalAmount').val().split(".").join("");
                    var totalPrice = itemPrice * totalAmount;
                    $('#totalValue').val(totalPrice);

	        		if ($('#totalValue').val().length) {
        				$('#totalValue').mask('000.000.000.000.000,00');
        				$('#totalValue').mask('000.000.000.000.000,00', {reverse: true});                  	
	        		} else {
        				$('#totalValue').mask('000.000.000.000.000,00');
        				$('#totalValue').mask('000.000.000.000.000,00', {reverse: true});            	
	        		}
                });

                var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		        	var retorno = JSON.parse(dadosRetorno)[5][0];
		        	$("#totalAmount").val(JSON.parse(retorno.Dados)[0].total).fadeIn();
		        });

                $(".save_button").click(function() {
                 	if ($(".no_latbars li a[name='Status_Supply_Chain'] span").hasClass("waiting")) {
                		var modal=new Modal();
	        			modal.open('Ação não realizada!',"É necessária a avaliação do Supply Chain.",!0,!1);
	        			return !1;
                	}

                 	var complete = true;
                	$('p,b').removeClass('red-alert');

        			if ($('#cus input:checked').length < 3) {
	    					$('.cus b, .cus').addClass('red-alert');
	    					complete = false;
    				}

    				if ($('#itemPrice').val() == '') {
    					$('.cus b, .cus').addClass('red-alert');
    					complete = false;
    				}

    				if ($('#totalAmount').val() == '') {
    					$('.Q-total b, .Q-total').addClass('red-alert');
    					complete = false;
    				}

    				if ($('select').hasClass('category') && (perfil === "Gerente Financeiro/Custos"  || perfil === "Superintendente" || perfil === "Administrator")) {
	                	if ($('select').val()=='') {
	        				$('.sel b, .sel').addClass('red-alert');
	        				complete = false;
	        			}
    				}

        			if (complete) {
                		vendapersonalizada.saverWorkFlow(code);	
        			}
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove()
				}

                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
            },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Financeiro Crédito`
			    * * Used webservices: VpList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

            financeiro_cre: function(code) {
                vendapersonalizada.vpListWriter(code);

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $("#totalValue").val(JSON.parse(retornoData.Obs_Financeiro_Custos)[0][2]).fadeIn();
                    },
                });

	        	$('input[name=feedback]').on('change', function() {
	        		if ($(this).attr('id') !== "feedbackYes") {
	        			$('textarea').attr('placeholder', 'Preencha este campo...');
	        			$('textarea').show();
	        			if (!$('textarea').val().length) {
	        			}
	        		} else {
	        			$('textarea').attr('placeholder', '');
	        		}
	        	});

	        	var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		        	var retorno = JSON.parse(dadosRetorno)[5][0];
		        	
		        	$('#totalAmount').val(JSON.parse(retorno.Dados)[0].total);
		        });

                $(".save_button").click(function() {
                	if ($(".no_latbars li a[name='Status_Financeiro_Custos'] span").hasClass("waiting")) {
                		var modal=new Modal();
	        			modal.open('Ação não realizada!',"É necessária a avaliação do Financeiro Custos.",!0,!1);
	        			return !1;
                	}
                	$('p,b').removeClass('red-alert');

                	if ($('#cre input:checked').length < 1) {
	    				$('.cre b, .cre').addClass('red-alert');
    				}

    				if ($('input[name=feedback]:checked').attr('id') !== "feedbackYes") {
	        			if ($('textarea').val()=='') {
	        				$('textarea').attr('placeholder', 'Preencha este campo...');
	        				$('.cre b, .cre').addClass('red-alert');
	        			} else {
		        			vendapersonalizada.saverWorkFlow(code);
		        		}
	        		} else {
	        			vendapersonalizada.saverWorkFlow(code);
	        		};
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove()
				}
                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
            },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Importação`
			    * * Used webservices: VpList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

            importacao: function(code) {
                vendapersonalizada.vpListWriter(code);

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

				$.ajax({
				    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
				    data: JSON.stringify(VPLIST),
				    type: 'POST',
				    contentType: "application/json; charset=utf-8",
				    traditional: true,
				    success: function(data) {
				        var retorno = JSON.parse(data);
				        var retornoData = JSON.parse(retorno[0].Aprovacao);
				        $('#evaluationDate').append(retornoData.Data_Negociacao);
				    },
				});

               $(".s_button").click(function() {
               		var complete = true;
                	$('p,b').removeClass('red-alert');

                	if ($('input:checked').length < 2) {
	    				$('.title,.title b').addClass('red-alert');
	    				complete = false;
    				}

    				if (complete) {
    					vendapersonalizada.saverWorkFlow(code);
    				};
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove();
				}

                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
            },

		    /**
			    * Load and write the content in `Fluxo de Aprovação -> Superintendência`
			    * * Used webservices: VpList, getVP
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

            superintendencia: function(code) {
            	$("#totalVolume").hide();
                vendapersonalizada.vpListWriter(code);
                $('#totalVolume').mask('000.000.000.000.000,00', {reverse: true});

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        var retornoData = JSON.parse(retorno[0].Aprovacao);
                        $('#evaluationDate').append(retornoData.Data_Superintendencia);
                    },
                });

                var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;

		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		        	$("#totalVolume").val(JSON.parse(dadosRetorno)[0].VolumeCompra).fadeIn();
		        });

	        	$('input[name=feedback]').on('change', function() {
	        		if ($(this).attr('id') !== "feedbackYes") {
	        			$('textarea').attr('placeholder', 'Preencha este campo...');
	        			$('textarea').show();
	        			if (!$('textarea').val().length) {
	        			}
	        		} else {
	        			$('textarea').attr('placeholder', '');
	        		}
	        	});
                $(".save_button").click(function() {
                	if ($(".no_latbars li a span.waiting").not('a[name=Status_Negociacao] span.waiting').length > 1) {
                		var modal=new Modal();
	        			modal.open('Ação não realizada!','Desconsiderando "Financeiro Custos" e "Importação", é necessária a avaliação de todos os envolvidos.',!0,!1);
	        			return !1;
                	}

                	var complete = true;
                	$('p,b').removeClass('red-alert');
                	if ($('#sup input:checked').length < 1) {
	    				$('.sup b, .sup').addClass('red-alert');
	    				complete = false;
    				}

    				if ($('#totalVolume').val() == '') {
    					$('.vol b, .vol').addClass('red-alert');
    					complete = false;
    				}

    				if ($('input[name=feedback]:checked').attr('id') !== "feedbackYes") {
	        			if ($('textarea').val()=='') {
	        				$('textarea').attr('placeholder', 'Preencha este campo...');
	        				$('.sup b, .sup').addClass('red-alert');
	        				complete = false;
	        			}
	        		}

	        		if (complete) {
	        			vendapersonalizada.saverWorkFlow(code, !0);
	        		}
                });

				if (!$('a[name=Status_Superintendencia] span.waiting').length) {
					$('input[value=Salvar]').remove()
				}

                $(".close").click(function() {
                    window.location.href="#/fluxo/resumo/"+vendapersonalizada.vpCode;
                });
            },

		    /**
			    * Search and list the VPs that already passed the approval flow. Each VP number link redirect the user for Proposals Elaboration, filled by a selling manager. 
			    * * Used webservices: PropostaList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        validacao_inicial: function(code) {
	        	var self = this;

	        	// Datepicker para os campos de data
				
				if ($(window).width() >= 1024) {
		        	$("#emissionDate, #proposalDate, #clientDate, #finishDate").datepicker({
						defaultDate: "+1w",
						showAnim: "",
						changeMonth: true,
						changeYear: true,
						numberOfMonths: 1,
						monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
						monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
						dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
						dateFormat:"dd/mm/yy",
					    beforeShow: function (input, inst) {
					        var rect = input.getBoundingClientRect();
					        setTimeout(function () {
						        inst.dpDiv.css({ top: rect.top + 50, left: rect.left + 0 });
					        }, 0);
					    }
					});
		        }

		        // Se mobile, modifica os campos de data para type date
				
				if ($(window).width() < 1024) {
					$('body').css('overflow-x', 'auto');
					$('#emissionDate, #proposalDate, #clientDate, #finishDate').prop('type', 'date');
				}

				// Retorna resultado, considerando os filtros dentro de PROPLIST. Resultado será apresentado na tabela

            	$('#search').click(function() {
                    var PROPLIST = {
                        Cliente: $('#clientName').val(),
                        CodCliente: $('#clientCode').val(),
                        Considerada: 0,
                        Gestor: $('#manager').val(),
                        Data: $('#emissionDate').val(),
                        DataEncerramento: $('#finishDate').val(),
                        DataEnvio: $('#clientDate').val(),
                        DataProposta: $('#proposalDate').val(),
                        Obs: "",
                        Resposta: "",
                        Status: $('#status').val(),
                        StatusCliente: "",
                        VPNumber: $('#vpNumber').val(),
                        VPCode:"",
                        VPCodeBase: ""
                    }

                    if (self.usr.TIPO === "GESTOR") {
                    	PROPLIST.GesRep = self.usr.VKBUR;
                    } else if (self.usr.TIPO === "REPRESENTANTE") {
                    	PROPLIST.GesRep = self.usr.CodRepresentante;
                    } else {
                    	PROPLIST.GesRep = "X";
                    }

                    $.ajax({
                        url: 'http://was-dev/Focus24/Services/VP.svc/PropostaList/0',
                        data: JSON.stringify(PROPLIST),
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: function(data) {
                            retorno = JSON.parse(data);
                            $('dd').remove();

                            $.each(retorno, function(index, value) {
	                            var self = this;

	                            $('dt[name], dt[hasReview]').each(function(a, b) {
	                                html = "<dd>";

                                    if ($(this).attr("link")) {
                                    	html += "<a href='#validacao/resumo/" + self[$(this).attr("name")] + "'>" + self[$(this).attr("name")] + "</a>";
                                    } else if ($(this).attr("hasreview")) {
                                    	if (self.StatusCliente === "REVISADA") {
                                    		html += "VIDE SOLICITAÇÃO <a href='#/solicitacao/dados/" + self.VPCodeBase + "'>" + self.VPCodeBase + "</a>";
                                    	} else {
                                    		html += self[$(this).attr("name")] + "</dd>";
                                    	}
                                    } else {
	                               		html += self[$(this).attr("name")] + "</dd>";
                                    }

	                                $(this).after(html);
	                            });
	                        });
							
							// Substitui textos da tabela
							
							$('dl.w-12_5 dd').each(function() {
								if ($(this).text() === "APROVADA") {
									$(this).text('EM DESENVOLVIMENTO');
									$(this).css('line-height', '0px');
									$(this).css('font-size', '0.60em');
								}

								if ($(this).text() === "REPROVADA") {
									$(this).text('ENCERRADA');
								}
							});

							$('dd:contains("VIDE SOLICITAÇÃO")').css('line-height', '0');
                        },
                    });
                });

				$('#clear').click(function() {
					$('div.content div input[type=text], div.content div select, div.content div input[type=date]').val('');
				});

				$('main div.table_min dl dd a').click(function() {
	        		vendapersonalizada.loader(1);
	        		vendapersonalizada.load('validacao/resumo');
				});
	        },

		    /**
			    * Load content in `#validacao/resumo/{VP_ID}`
			    * * Used webservices: VpList, getVP, PropostaList, SalvaProposta
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        validacao_resumo: function(code) {
	        	
	        	// Monta json para passar ao template de pdf

	        	var self = this;
	        	var HTMLProposta = {
	        		Status: "",
	        		inputs: {},
	        		elem: {},
	        		checks: [],
	        		colors: []
	        	}; 
	        	
	        	$('div.vpResume ul.consideredActions input[type=radio]').click(function() {
					$('div.impracticable, div.practicable').addClass('hide');
					var _t = $(this).val();

					switch(_t) {
					    case '3':
					        $('div.vpResume div.impracticable').removeClass('hide');
					        break;
					    case '1':
					        break;
					    case '2':
					        $('div.vpResume div.practicable').removeClass('hide');
					        break;
					    default:
					        null;
					}
	        	});

	        	// Datepicker para os campos de data
				
				if ($(window).width() >= 1024) {
		        	$("#limitedDateFocus, #hasCutFocus, #needShowcaseFocus, #requiresExclusivityDateFocus").datepicker({
						defaultDate: "+1w",
						showAnim: "",
						changeMonth: true,
						changeYear: true,
						numberOfMonths: 1,
						monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
						monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
						dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
						dateFormat:"dd/mm/yy",
					    beforeShow: function (input, inst) {
					        var rect = input.getBoundingClientRect();
					        setTimeout(function () {
					        	if (inst.id !== 'requiresExclusivityDateFocus') {
						        	inst.dpDiv.css({ top: rect.top + 50, left: rect.left + 0 });
						        } else {
						        	inst.dpDiv.css({ top: rect.top + 500, left: rect.left + 0 });
						        }
						        if (inst.id === 'requiresExclusivityDateFocus' && rect.bottom < 800) {
						        	inst.dpDiv.css({ top: rect.top + 400, left: rect.left + 0 });
						        }
					        }, 0);
					    }
					});
		        }

		        // Se mobile, modifica os campos de data para type date
				
				if ($(window).width() < 1024) {
					$("#limitedDateFocus, #hasCutFocus, #needShowcaseFocus, #requiresExclusivityDateFocus").prop('type', 'date');
				}

	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var date = JSON.parse(data)[0].Data;
                        $('#clientDate').append(date);
                        var approval = 1;
                        var unviable = 3;
                        var approvement = [];
                        var approvement_aux = JSON.parse(data)[0].Aprovacao;
                        var val = JSON.parse(approvement_aux);
                        approvement.push(val.Status_Comercial, val.Status_Diretoria_Comercial, val.Status_Financeiro_Credito, val.Status_Projetos_Especiais, val.Status_Superintendencia, val.Status_Supply_Chain);
                        
                        // Determina a aprovação dessa VP, baseado nos Status do Fluxo de Aprovação
                        // 
                        // Valor padrão de approval é 1. Caso seja "Viável com Restrição", approval será 2. Caso seja "Inviável", approval será 3

                        for (i = 0; i < approvement.length; i++) {
                        	if (approvement[i] > 1) {
                        		approval = 2;
                        	}
                        	if (approvement[i] !== 3) {
                        		unviable = 0;
                        	}
                        }

                        $('[name=considered]').each(function() {
                        	var currentVal = parseInt($(this).attr('value'));

                        	if (currentVal === unviable) {
                        		$(this).trigger('click');
                        		$(this).prop('checked', true);
                        		$('[name=considered]').attr('disabled', true);
                        	} else {
	                        	if (currentVal === approval) {
	                        		$(this).trigger('click');
	                        		$('[name=considered]').attr('disabled', true);
	                        	}
                        	}
                        });
                    },
                });

				// Popula tela de Elaboração de Proposta e prepara HTMLProposta, utilizado para o envio de e-mail

				var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		        	var retorno = JSON.parse(dadosRetorno)[0];
		        	var data = JSON.parse(dadosRetorno);
		        	vendapersonalizada.vpData=[];
		        	vendapersonalizada.vpData.push(retorno);
		        	var retorno_aux = JSON.parse(dadosRetorno)[5];
		        	var retornoQuantidade = JSON.parse(retorno_aux[0].Dados);
		        	$('#clientVpNumber').append(code);
		        	$('#clientCode').append(retorno.Cod);
		        	$('#clientName').append(retorno.Nome);
		        	$('#phone').append(retorno.Telefone);
		        	$('#contact').append(retorno.Contato);
		        	$('#email').append(retorno.Email);
		        	$('#commercialManager').append(retorno.Gestor);
		        	$('#contact2').append(retorno.Contato);
		        	$('#phone2').append(retorno.Telefone);
		        	$('#email2').append(retorno.Email);

        			if (retornoQuantidade[0].uni === "amountMetros") {
        				$('#totalAmount').append(retornoQuantidade[0].total + ' Metros');
        				HTMLProposta.inputs["totalAmount"]=retornoQuantidade[0].total + ' Metros';
        			} else {
        				$('#totalAmount').append(retornoQuantidade[0].total + ' Quilos');
        				HTMLProposta.inputs["totalAmount"]=retornoQuantidade[0].total + ' Quilos';
        			}

		        	if (retornoQuantidade[2][1] === 'limitedDateYes') {
		        		$('#limitedDate').append('Sim');
		        		$('#limitedDateValue').append(retornoQuantidade[3][0]);
		        		$('[name=date1]').removeClass('hide');
		        		HTMLProposta.inputs["limitedDateValue"]=retornoQuantidade[3][0];
		        	} else {
		        		$('#limitedDate').append('Não');
		        		$('#limitedDateValue').append('-');
		        		HTMLProposta.inputs["limitedDateValue"]="";
		        	}

		        	if (retornoQuantidade[2][2] === 'hasCutYes') {
		        		$('#hasCut').append('Sim');
		        		$('#hasCutValue').append(retornoQuantidade[3][1]);
		        		$('[name=date2]').removeClass('hide');
		        		HTMLProposta.inputs["hasCutValue"]=retornoQuantidade[3][1];
		        	} else {
		        		$('#hasCut').append('Não');
		        		$('#hasCutValue').append('-');
		        		HTMLProposta.inputs["hasCutValue"]="";
		        	}

		        	if (retornoQuantidade[2][3] === 'needShowcaseYes') {
		        		$('#needShowcase').append('Sim');
		        		$('#needShowcaseValue').append(retornoQuantidade[3][2]);
		        		$('[name=date3]').removeClass('hide');
		        		HTMLProposta.inputs["needShowcaseValue"]=retornoQuantidade[3][2];
		        	} else {
		        		$('#needShowcase').append('Não');
		        		$('#needShowcaseValue').append('-');
		        		HTMLProposta.inputs["needShowcaseValue"]="";
		        	}

		        	if (retornoQuantidade[2][4] === 'requiresExclusivityYes') {
		        		$('#requiresExclusivityDate').append('Sim');
		        		if (retornoQuantidade[2][5] === 'exclusivityBase') {
		        			$('#requiresExclusivityDate').append(' / Base');
		        		}

		        		if (retornoQuantidade[2][5] === 'exclusivityColor') {
		        			$('#requiresExclusivityDate').append(' / Cor');
		        		}
		        		
		        		if (retornoQuantidade[2][5] === 'exclusivityStamp') {
		        			$('#requiresExclusivityDate').append(' / Estampa');
		        		}

		        		if (retornoQuantidade[2][6] !== undefined) {
			        		if (retornoQuantidade[2][6] === 'exclusivityBase') {
			        			$('#requiresExclusivityDate').append(' / Base');
			        		}

			        		if (retornoQuantidade[2][6] === 'exclusivityColor') {
			        			$('#requiresExclusivityDate').append(' / Cor');
			        		}
			        		
			        		if (retornoQuantidade[2][6] === 'exclusivityStamp') {
			        			$('#requiresExclusivityDate').append(' / Estampa');
			        		}
			        	}
			        	
			        	if (retornoQuantidade[2][7] !== undefined) {
			        		if (retornoQuantidade[2][7] === 'exclusivityBase') {
			        			$('#requiresExclusivityDate').append(' / Base');
			        		}

			        		if (retornoQuantidade[2][7] === 'exclusivityColor') {
			        			$('#requiresExclusivityDate').append(' / Cor');
			        		}
			        		
			        		if (retornoQuantidade[2][7] === 'exclusivityStamp') {
			        			$('#requiresExclusivityDate').append(' / Estampa');
			        		}
			        	}

		        		$('#requiresExclusivityDateValue').append(retornoQuantidade[3][3]);
		        		HTMLProposta.inputs["requiresExclusivityDateValue"]=retornoQuantidade[3][3];
		        		$('[name=date4]').removeClass('hide');
		        	} else {
		        		$('#requiresExclusivityDate').append('Não');
		        		$('#requiresExclusivityDateValue').append('-');
		        		HTMLProposta.inputs["requiresExclusivityDateValue"]="";
		        	}

		        	$('#width').after(retornoQuantidade[1].width);
		        	HTMLProposta.elem["width"]=retornoQuantidade[1].width;

		        	if (retornoQuantidade[2][0] === 'exportByAir') {
		        		$('#exportBy').append('Aéreo');
		        	} else {        	
		        		$('#exportBy').append('Marítimo');
		        	}

		        	var colors = retornoQuantidade[0].colors.split(',');
		        	var qtd = retornoQuantidade[0].qtd.split(',');
		        	
		        	for (i = 0; i < colors.length -1; i++) {
		        		currentColor = colors[i].split(' | ')[0];
		        		currentType = colors[i].split(' | ')[1];
		        		pantoneType = colors[i].split(' | ')[2];
		        		currentQtd = qtd[i];
		        		var obj = {};
		        		obj["colorName"] = currentColor;
		        		obj["colorAmount"] = currentQtd;
		        		$('#colorName').append('<dd>' + currentColor + '</dd>');

		        		if (pantoneType !== undefined) {
		        			obj["colorType"]=currentType + " | " + pantoneType;
		        			$('#colorType').append('<dd>' + currentType + ' | ' + pantoneType + '</dd>');
		        		} else {
		        			obj["colorType"]=currentType;
		        			$('#colorType').append('<dd>' + currentType + '</dd>');
		        		}
		        		
		        		$('#colorAmount').append('<dd>' + currentQtd + '</dd>');
		        		HTMLProposta.colors.push(obj);
		        	}

		        	var data = JSON.parse(dadosRetorno);

		        	if (data[2].Novo) {
			        	var VPLIST = {
		                    Aprovacao: "",
		                    Cliente: "",
		                    CodCliente:"",
		                    CodRepre: "",
		                    Data: "",
		                    Gestor: "",
		                    Representante: "",
		                    Status: "",
		                    VPNumber: vendapersonalizada.vpCode,
		                    VPCode:"",
		                    VPNumberBase: ""
		                }
		                
		                $.ajax({
		                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
		                    data: JSON.stringify(VPLIST),
		                    type: 'POST',
		                    contentType: "application/json; charset=utf-8",
		                    traditional: true,
		                    success: function(data) {
		                        var retorno = JSON.parse(JSON.parse(JSON.parse(data)[0].Aprovacao).Obs_Projetos_Especiais);
				        		$('#itemCode').val(retorno[0][0]);
				        		$('#itemName').val(retorno[0][1]);
				        	},
		                });
		        	} else {
		        		$('#itemCode').val(data[2].CodigoAmostra);
		        		$('#itemName').val(data[2].Alteracao.split(' - ')[1]);
		        	}
	        	});

		        var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({		
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',		
                    data: JSON.stringify(VPLIST),		
                    type: 'POST',		
                    contentType: "application/json; charset=utf-8",		
                    traditional: true,		
                    success: function(data) {		
                        var retorno = JSON.parse(data);		
                        var retornoAux = JSON.parse(retorno[0].Aprovacao);		
                        var retornoData = JSON.parse(retornoAux.Obs_Financeiro_Custos);
                        var retornoSignal = JSON.parse(retornoAux.Obs_Comercial)[1][2];	
                        var retornoSignalText = JSON.parse(retornoAux.Obs_Comercial)[0][0];		
			        	var uni;

						if (retornoData[1][1] === 'byMetros') {		
							uni = ' / Metro';		
						} else {		
							uni = ' / Quilo'		
						}		
			        	
			        	if (retornoData[1][0] === 'currencyReal') {		
			        		$('#price').after('R$' + retornoData[0][0] + uni);	
			        		HTMLProposta.inputs["price"]='R$' + retornoData[0][0] + uni;	
			        	} else {        			
			        		$('#price').after('US$' + retornoData[0][0] + uni);		
			        		HTMLProposta.inputs["price"]='US$' + retornoData[0][0] + uni;	
			        	}
			        	
			        	if (retornoSignal === "needPayTen") {
			        		$('#signal').after('10%');
			        		HTMLProposta.inputs["signal"]='10%';	
			        		$('#signal').removeClass('hide');
			        	}
			        	
			        	if (retornoSignal === "needPayTwenty") {
			        		$('#signal').after('20%');
			        		HTMLProposta.inputs["signal"]='20%';
			        		$('#signal').removeClass('hide');
			        	}
			        	
			        	if (retornoSignal === "needPayThirty") {
			        		$('#signal').after('30%');
			        		HTMLProposta.inputs["signal"]='30%';
			        		$('#signal').removeClass('hide');
			        	}
			        	
			        	if (retornoSignalText.length) {
			        		$('#signal').after(retornoSignalText + '%');
			        		HTMLProposta.inputs["signal"]=retornoSignalText + '%';
			        		$('#signal').removeClass('hide');
			        	}
                    },		
                });

                var PROPLIST = {
                    Cliente: '',
                    CodCliente: '',
                    Considerada: 0,
                    Data: '',
                    DataEncerramento: '',
                    DataEnvio: '',
                    DataProposta: '',
                    Obs: '',
                    Resposta: '',
                    Status: $('#status').val(),
                    StatusCliente: "",
                    VPNumber: code
                }

                if (self.usr.TIPO === "GESTOR") {
                	PROPLIST.GesRep=self.usr.VKBUR;
                } else if (self.usr.TIPO === "REPRESENTANTE") {
                	PROPLIST.GesRep=self.usr.CodRepresentante;
                } else {
                	PROPLIST.GesRep="X";
                }
                
                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/PropostaList/0',
                    data: JSON.stringify(PROPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data)[0];

                        // Se Considerada == -1, preenche os campos

                        if (retorno.Considerada === -1) {
                        	$('.btn.submit, .btn.save').removeClass('hide');
                        	var fields = JSON.parse(retorno.Obs)[0];
                        	
                        	for (i = 0; i < fields.length; i++) {
                        		var currentField = fields[i].split(':');

                        		$('input, textarea').each(function() {
                        			if ($(this).attr('id') === currentField[0]) {
                        				$(this).trigger('click');
                        				$(this).val(currentField[1]);
                        			}
                        		});
                        	}
                        } else {

							// Se Considerada !== -1, preenche os campos e remove os botões de Salvar Dados e Enviar E-mail

                        	$('.btn.submit, .btn.save').remove();
                        	var fields = JSON.parse(retorno.Obs)[0];
                        	
                        	for (i = 0; i < fields.length; i++) {
                        		var currentField = fields[i].split(':');

                        		$('input, textarea').each(function() {
                        			if ($(this).attr('id') === currentField[0]) {
                        				$(this).trigger('click');
                        				$(this).val(currentField[1]);
                        			}
                        		});
                        	}
                        }
                    },
                });

				$('#qualityOtherBox').click(function() {
					if ($(this).is(':checked')) {
						$('#qualityOther').removeAttr('disabled');
					} else {
						$('#qualityOther').attr('disabled', true);
						$('#qualityOther').val('');
					}
				});

				if ($('.hasDatepicker').parents('.hide').length < 4) {
					$('a.btn.submit, a.btn.save').hide();
				}

				$('input[name=dateFocus]').on('change', function() {
					var complete = true;

					$('.hasDatepicker').each(function() {
						if ($(this).parent().not('.hide').length) {
							if (!$(this).val().length) {
								complete = false;
							}
						}
					});

					if (complete) {
						$('a.btn.submit, a.btn.save').show();
					} else {
						$('a.btn.submit, a.btn.save').hide();
					}
				});

				// Salva os dados inseridos na tela de Elaboração de Proposta

				$('.btn.save').click(function() {
					var fields = [];
					var status = "PENDENTE";
					var check = parseInt($('input[type=radio]:checked').attr('value'));

					if (check === 2) {
						fields.push('viableWithRestriction:' + $('textarea').eq(0).val());
					}
					
					if (check === 3) {
						fields.push('unviable:' + $('textarea').eq(1).val());
					}
					
					if (check === 2) {
						HTMLProposta.Status = "VIÁVEL COM RESTRIÇÃO"
					} else {
						HTMLProposta.Status = status;
					}
					
					$('dd[data-required=required] , p[data-required=required]').each(function() {
						HTMLProposta.elem["" + $(this).attr("id")] = $(this).text();
            			//HTMLProposta.inputs.push($(this).attr("id")+":"+$(this).val())
            		})

            		$('input[data-required=required]').each(function() {
						HTMLProposta.elem["" + $(this).attr("id")] = $(this).val();
            			//HTMLProposta.inputs.push($(this).attr("id")+":"+$(this).val())
            		})

					$('input[type=checkbox]:checked').each(function() {
						if ($(this).attr('id') !== 'qualityOtherBox') {
							HTMLProposta.checks.push($(this).attr("val"));
						}
						fields.push($(this).attr('id'));
					});
					
					$('input[type=text]').each(function() {
						HTMLProposta.inputs["" + $(this).attr("id")] = $(this).val();
						if ($(this).val().length) {
							fields.push($(this).attr('id') + ':' + $(this).val());
						}
					});
					
					if (HTMLProposta.inputs.qualityOther.length) {
						HTMLProposta.checks.push(HTMLProposta.inputs.qualityOther);
					}
					
					$('textarea').each(function() {
						HTMLProposta.inputs["" + $(this).attr("id")] = $(this).val();
					});
					
					if ($('#comment').val().length) {
						fields.push('comment:' + $('#comment').val());
					}
					
					if ($('#considered-item-2').is(':checked') && !$('textarea').eq(0).val().length || $('#considered-item-3').is(':checked') && !$('textarea').eq(1).val().length) {
						$('textarea').not('#comment').attr('placeholder', 'Preencha este campo...');
					} else {
						vendapersonalizada.loader(1);

	                    var PROP = {
	                    	Considerada: check,
	                    	Obs: '['+JSON.stringify(fields)+']',
	                    	Resposta: '',
	                    	Status: status,
	                    	HTMLProposta:JSON.stringify(HTMLProposta),
	                    	Tipo: 3,
	                    	VPNumber: vendapersonalizada.vpData[0].VPNumber
	                    }

	                    $.ajax({
	                        url: 'http://was-dev/Focus24/Services/VP.svc/SalvaProposta/0',
	                        data: JSON.stringify(PROP),
	                        type: 'POST',
	                        contentType: "application/json; charset=utf-8",
	                        traditional: true,
	                        success: function(data) {
	                        	window.location.reload();
	                        }
	                    });
	                }
				});

				// Salva os dados inseridos na tela de Elaboração de Proposta e Envia E-mail para Representante

				$('.btn.submit').click(function() {
					var fields = [];
					var status;
					var check = parseInt($('input[type=radio]:checked').attr('value'));
					
					if (check === 1) {
						status = 'VIÁVEL';
					}
					
					if (check === 2) {
						status = 'RESTRIÇÃO';
						fields.push('viableWithRestriction:' + $('textarea').eq(0).val());
					}
					
					if (check === 3) {
						status = 'INVIÁVEL';
						fields.push('unviable:' + $('textarea').eq(1).val());
					}
					
					if (check === 2) {
						HTMLProposta.Status = "VIÁVEL COM RESTRIÇÃO"
					} else {
						HTMLProposta.Status = status;
					}
					
					$('dd[data-required=required] , p[data-required=required]').each(function() {
						HTMLProposta.elem["" + $(this).attr("id")] = $(this).text();
            			//HTMLProposta.inputs.push($(this).attr("id")+":"+$(this).val())
            		})

            		$('input[data-required=required]').each(function() {
						HTMLProposta.elem["" + $(this).attr("id")] = $(this).val();
            			//HTMLProposta.inputs.push($(this).attr("id")+":"+$(this).val())
            		})

					$('input[type=checkbox]:checked').each(function() {
						if ($(this).attr('id') !== 'qualityOtherBox') {
							HTMLProposta.checks.push($(this).attr("val"));
						}
						fields.push($(this).attr('id'));
					});
					
					$('input[type=text]').each(function() {
						HTMLProposta.inputs["" + $(this).attr("id")] = $(this).val();
						if ($(this).val().length) {
							fields.push($(this).attr('id') + ':' + $(this).val());
						}
					});
					
					if (HTMLProposta.inputs.qualityOther.length) {
						HTMLProposta.checks.push(HTMLProposta.inputs.qualityOther);
					}
					
					$('textarea').each(function() {
						HTMLProposta.inputs["" + $(this).attr("id")] = $(this).val();
					});
					
					if ($('#comment').val().length) {
						fields.push('comment:' + $('#comment').val());
					}
					
					if ($('#considered-item-2').is(':checked') && !$('textarea').eq(0).val().length || $('#considered-item-3').is(':checked') && !$('textarea').eq(1).val().length) {
						$('textarea').not('#comment').attr('placeholder', 'Preencha este campo...');
					} else {
						vendapersonalizada.loader(1);

	                    var PROP = {
	                    	Considerada: check,
	                    	Obs: '['+JSON.stringify(fields)+']',
	                    	Resposta: '',
	                    	Status: status,
	                    	HTMLProposta:JSON.stringify(HTMLProposta),
	                    	Tipo: 1,
	                    	VPNumber: vendapersonalizada.vpData[0].VPNumber
	                    }
	                    $.ajax({
	                        url: 'http://was-dev/Focus24/Services/VP.svc/SalvaProposta/0',
	                        data: JSON.stringify(PROP),
	                        type: 'POST',
	                        contentType: "application/json; charset=utf-8",
	                        traditional: true,
	                        success: function(data) {
	                        	vendapersonalizada.loader(0);
	                        	var modal=new Modal();
	                            modal.open('Proposta No. ' + code + ' foi salva e email enviado para representante!',"Feche esta janela.",!1,vendapersonalizada.redirectProposta);
	                        }
	                    });
	                }
				});
	        },

		    /**
			    * Search and list the VPs that already passed the approval flow. Each VP number link redirect the user for Validation page, filled by a representative. 
			    * * Used webservices: PropostaList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        validacao_rep: function(code) {
	        	var self = this;

	        	// Datepicker para os campos de data
				
				if ($(window).width() >= 1024) {
		        	$("#emissionDate, #proposalDate, #clientDate, #finishDate").datepicker({
						defaultDate: "+1w",
						showAnim: "",
						changeMonth: true,
						changeYear: true,
						numberOfMonths: 1,
						monthNames: ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'],
						monthNamesShort: ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'],
						dayNamesMin: ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'],
						dateFormat:"dd/mm/yy",
					    beforeShow: function (input, inst) {
					        var rect = input.getBoundingClientRect();
					        setTimeout(function () {
						        inst.dpDiv.css({ top: rect.top + 50, left: rect.left + 0 });
					        }, 0);
					    }
					});
		        }

		        // Se mobile, modifica os campos de data para type date
				
				if ($(window).width() < 1024) {
					$('body').css('overflow-x', 'auto');
					$('#emissionDate, #proposalDate, #clientDate, #finishDate').prop('type', 'date');
				}

				// Retorna resultado, considerando os filtros dentro de PROPLIST. Resultado será apresentado na tabela

            	$('#search').click(function() {
                    var PROPLIST = {
                        Cliente: $('#clientName').val(),
                        CodCliente: $('#clientCode').val(),
                        Considerada: 0,
                        Gestor: $('#manager').val(),
                        Data: $('#emissionDate').val(),
                        DataEncerramento: $('#finishDate').val(),
                        DataEnvio: $('#clientDate').val(),
                        DataProposta: $('#proposalDate').val(),
                        Obs: "",
                        Resposta: "",
                        Status: $('#status').val(),
                        StatusCliente: "",
                        VPNumber: $('#vpNumber').val(),
                        VPCode:"",
                        VPCodeBase: ""
                    }

                    if (self.usr.TIPO === "GESTOR") {
                    	PROPLIST.GesRep = self.usr.VKBUR;
                    } else if (self.usr.TIPO === "REPRESENTANTE") {
                    	PROPLIST.GesRep = self.usr.CodRepresentante;
                    } else {
                    	PROPLIST.GesRep = "X";
                    }

                    $.ajax({
                        url: 'http://was-dev/Focus24/Services/VP.svc/PropostaList/0',
                        data: JSON.stringify(PROPLIST),
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: function(data) {
                            retorno = JSON.parse(data);
                            $('dd').remove();

                            $.each(retorno, function(index, value) {
	                            var self = this;

	                            $('dt[name], dt[hasReview]').each(function(a, b) {
	                                html = "<dd>";

                                    if ($(this).attr("link")) {
                                    	html += "<a href='#validacao/rep/" + self[$(this).attr("name")] + "'>" + self[$(this).attr("name")] + "</a>";
                                    } else if ($(this).attr("hasreview")) {
                                    	if (self.StatusCliente === "REVISADA") {
                                    		html += "VIDE SOLICITAÇÃO <a href='#/solicitacao/dados/" + self.VPCodeBase + "'>" + self.VPCodeBase + "</a>";
                                    	} else {
                                    		html += self[$(this).attr("name")] + "</dd>";
                                    	}
                                    } else {
	                               		html += self[$(this).attr("name")] + "</dd>";
                                    }

	                                $(this).after(html);
	                            });
	                        });
							
							// Substitui textos da tabela

							$('dl.w-12_5 dd').each(function() {
								if ($(this).text() === "APROVADA") {
									$(this).text('EM DESENVOLVIMENTO');
									$(this).css('line-height', '0px');
									$(this).css('font-size', '0.60em');
								}

								if ($(this).text() === "REPROVADA") {
									$(this).text('ENCERRADA');
								}
							});

							$('dd:contains("VIDE SOLICITAÇÃO")').css('line-height', '0');
                        },
                    });
                });

				$('#clear').click(function() {
					$('div.content div input[type=text], div.content div select, div.content div input[type=date]').val('');
				});
	        },

		    /**
			    * Load content in `#validacao/rep/{VP_ID}`
			    * * Used webservices: VpList, getVP, PropostaList, SalvaProposta, CopiaVP
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        validacao_result: function(code) {
	        	var self = this;
	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data)[0];
                        $('#representante').append(retorno.Representante);
                        $('#data').append(retorno.Data);
                        $('#numero').append(retorno.VPCode);
                    },
                });

        		var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/" + code;
		        $.getJSON(vpCode +"?callback=?", function (dadosRetorno) {
		        	var retorno = JSON.parse(dadosRetorno)[0];
		        	var total;
		        	vendapersonalizada.vpData = [];
		        	vendapersonalizada.vpData.push(retorno);
		        	var retorno_aux = JSON.parse(dadosRetorno)[5];
		        	var retornoQuantidade = JSON.parse(retorno_aux[0].Dados);
		        	var dateNow = new Date().toJSON().slice(0,10);
		        	var date = dateNow.slice(8) + '/' + dateNow.slice(5,7) + '/' + dateNow.slice(0, 4);
		        	var colors = (retornoQuantidade[0].colors.split(','));
		        	var qtd = (retornoQuantidade[0].qtd.split(','));
		        	$('input[id*="quantidadeConfirmada"]').mask('00.000.000', {reverse: true});

		        	$('#razaoSocial').append(retorno.Razao);
		        	$('#nomeFantasia').append(retorno.Nome);
		        	$('#nomeContato').append(retorno.Contato);
		        	$('#gestor').append(retorno.Gestor);
		        	$('#marca').append(retorno.Marca);
		        	$('#email').append(retorno.Email);
		        	$('#codigoCliente').append(retorno.Cod);
		        	$('#telefone').append(retorno.Telefone);
		        	$('#dataAprovacaoInput').val(date);
		        	$('#justify').val(retornoQuantidade[0].total);

		        	if (retornoQuantidade[0].uni === "amountMetros") {
		        		$('#unit-item-1').prop('checked', true);
		        	} 

		        	if (retornoQuantidade[0].uni === "amountKilos") {
		        		$('#unit-item-2').prop('checked', true);
		        	}

		        	for (i = 0; i < colors.length -1; i++) {
		        		currentColor = colors[i];
		        		currentQtd = qtd[i];
		        		$('.info').eq(1).append('<li><strong>Cores / Código: </strong><div class="w-270"><input id="corPantone'+i+'" type="text" name="coresPantone" value="' + currentColor + '" disabled></div></li><li><strong>Quantidade Original: </strong><div class="w-110"><input id="quantidadeOriginal'+i+'" type="text" name="quantidadeOriginal" value="' + currentQtd + '" disabled></div></li><li><strong>Quantidade Confirmada: </strong><div class="w-110"><input id="quantidadeConfirmada'+i+'" type="text" name="quantidadeConfirmada" data-cod="'+i+'"></input></div></li>');
		        	}

					if ($('.approved .info li').length) {
						$('.info').eq(1).append('<li></li><li></li><li><strong>Quantidade Total Confirmada: </strong><div class="w-110"><input id="quantidadeTotalConfirmada" type="text" disabled></div></li>');
	        		}

	        		$('input[id*="quantidadeConfirmada"]').on('keyup', function() {
	        			var sum = 0;

	        			$('input[id*="quantidadeConfirmada"]').each(function() {
	        				if ($(this).val().length) {
		        				var val = parseInt($(this).val().split(".").join(""));
		        				sum += val;
		        			}
	        			});

	        			$('#quantidadeTotalConfirmada').val(sum);

		        		if ($('#quantidadeTotalConfirmada').val().length > 5) {
			        		$('#quantidadeTotalConfirmada').mask('000.000.000');
			        		$('#quantidadeTotalConfirmada').mask('000.000.000', {reverse: true});
		        		} else {
			        		$('#quantidadeTotalConfirmada').mask('00.000.000');
			        		$('#quantidadeTotalConfirmada').mask('00.000.000', {reverse: true});
		        		}
	        		});

	        		$('input[id*="quantidadeConfirmada"]').on('blur', function() {
	        			if ($(this).val() !== $("#quantidadeOriginal"+$(this).attr("data-cod")).val()) {
	        				var modal = new Modal();
							modal.open('Atenção!',"Quantidade original alterada. Contatar o seu Gerente.",!0,!1);
	        			}
	        		});

		        	var data = JSON.parse(dadosRetorno);
		        	if (data[2].Novo) {
			        	var VPLIST = {
		                    Aprovacao: "",
		                    Cliente: "",
		                    CodCliente:"",
		                    CodRepre: "",
		                    Data: "",
		                    Gestor: "",
		                    Representante: "",
		                    Status: "",
		                    VPNumber: vendapersonalizada.vpCode,
		                    VPCode:"",
		                    VPNumberBase: ""
		                }
		                
		                $.ajax({
		                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
		                    data: JSON.stringify(VPLIST),
		                    type: 'POST',
		                    contentType: "application/json; charset=utf-8",
		                    traditional: true,
		                    success: function(data) {
		                        var retorno = JSON.parse(JSON.parse(JSON.parse(data)[0].Aprovacao).Obs_Projetos_Especiais);
				        		$('#itemCode').val(retorno[0][0]);
				        		$('#itemName').val(retorno[0][1]);
				        	},
		                });
		        	} else {
		        		$('#itemCode').val(data[2].CodigoAmostra);
		        		$('#itemName').val(data[2].Alteracao.split(' - ')[1]);
		        	}

	                var PROPLIST = {
	                    Cliente: '',
	                    CodCliente: '',
	                    Considerada: 0,
	                    Data: '',
	                    DataEncerramento: '',
	                    DataEnvio: '',
	                    DataProposta: '',
	                    Obs: '',
	                    Resposta: '',
	                    Status:"",
                        StatusCliente: $('#status').val(),
	                    VPNumber: vendapersonalizada.vpData[0].VPNumber
	                }

	                if (self.usr.TIPO === "GESTOR") {
                    	PROPLIST.GesRep = self.usr.VKBUR;
                    } else if (self.usr.TIPO === "REPRESENTANTE") {
                    	PROPLIST.GesRep = self.usr.CodRepresentante;
                    } else {
                    	PROPLIST.GesRep = "X";
                    }

	                $.ajax({
	                    url: 'http://was-dev/Focus24/Services/VP.svc/PropostaList/0',
	                    data: JSON.stringify(PROPLIST),
	                    type: 'POST',
	                    contentType: "application/json; charset=utf-8",
	                    traditional: true,
	                    success: function(data) {
	                        var retorno = JSON.parse(data)[0];
	                        if (retorno.Resposta !== null) {
		                        var content = JSON.parse(retorno.Resposta)[0];
		                        var checks = JSON.parse(retorno.Resposta)[1];
		                        var length = content.length + checks.length;
	                        	$('a.btn').not('.prev').remove();

		                        for (i = 0; i < length; i++) {
		                        	if (content[i] === undefined) {
		                        		content[i] = '';
		                        	}

		                        	if (checks[i] === undefined) {
		                        		checks[i] = '';
		                        	}

		                        	var currentInput = content[i].split(':');
		                        	var currentCheck = checks[i];

		                        	$('input[type=text], textarea').each(function() {
		                        		if ($(this).attr('id') === currentInput[0]) {
		                        			$(this).val(currentInput[1]);
		                        		}
		                        	});

		                        	$('input[type=radio]').each(function() {
		                        		if ($(this).attr('id') === currentCheck) {
		                        			$(this).prop('checked', true);
		                        			$(this).trigger('click');
		                        		}
		                        	});

		                        	$('input, textarea').prop('disabled', true);
		                        }
	                        }
	                    },
	                });
		        });
	        	$('form.finalResult ul li div input[name=approved]').click(function() {
	        		var _t = $(this);
	        		_t.closest('form').find('div.approved, div.disapproved').addClass('hide');

	        		switch($(this).val()) {
	        			case '1':
	        				_t.closest('form').find('div.approved').removeClass('hide');
	        				break;
	        			case '0':
	        				_t.closest('form').find('div.disapproved').removeClass('hide');
	        				break;
	        		}
	        		vendapersonalizada.navButtons(1);
	        	});

	        	$('input[name=review]').click(function() {
	        		if ($(this).attr('value') === "1") {
	        			$('.review').removeClass('hide');
	        			$('.cancel').addClass('hide');
	        		} else {
	        			$('.cancel').removeClass('hide');
	        			$('.review').addClass('hide');	
	        		}
	        	});

	        	$('a.btn').not('.prev').click(function() {
	        		var status;
	        		var approval = $('input[name=approved]:checked').attr('value');
	        		
	        		if (self.usr.Perfil.ValidacaoPropostaVP === 2) {
	        			var modal=new Modal();
                        modal.open('Ação não realizada!',"Você não possui a permissão necessária.",!0,!1);
                        return !1;
	        		}

	        		if ($(this).attr('name') === "approve") {
	        			status = 'APROVADA';
		        		$('div.disapproved input[type=text]').val('');
		        		$('div.disapproved textarea').val('');
		        		$('div.disapproved input:checked').prop('checked', false);
	        		}

	        		if ($(this).attr('name') === "cancel") {
	        			status = 'REPROVADA';
		        		$('div.approved input[type=text]').val('');
		        		$('div.approved input:checked').prop('checked', false);
	        		}

	        		if ($(this).attr('name') === "review") {
	        			status = 'REVISADA';
		        		$('div.approved input[type=text]').val('');
		        		$('div.approved input:checked').prop('checked', false);
	        		}

	        		var Validate = {
						inputs: [],
						checks: [],
					}

					$('input:checked').each(function() {
						Validate.checks.push($(this).attr('id'));
					});

					$('input[type=text], textarea').each(function() {
						if ($(this).val().length) {
							Validate.inputs.push($(this).attr('id') + ':' + $(this).val());
						}
					});

					$('a.btn').not($(this)).remove();
					var PROP = {
						Considerada: parseInt(approval),
						Obs: '',
						Resposta: "["+JSON.stringify(Validate.inputs)+","+JSON.stringify(Validate.checks)+"]",
						Status: status,
                    	HTMLProposta:$("html").html(),
						Tipo: 2,
						VPNumber: vendapersonalizada.vpData[0].VPNumber
					}

					// Salva dados da tela Validação da Proposta pelo Cliente

					$.ajax({
						url: 'http://was-dev/Focus24/Services/VP.svc/SalvaProposta/0',
						data: JSON.stringify(PROP),
						type: 'POST',
						contentType: "application/json; charset=utf-8",
						traditional: true,
						success: function(data) {
							if ($('a.btn').attr('name') === 'approve') {
	                            var modal = new Modal();
	                            modal.open('Proposta de VP ' + code + ' aprovada!',"Feche esta janela.", !1 ,vendapersonalizada.goHome);
							}

							if ($('a.btn').attr('name') === 'review') {
				        		$.get("http://was-dev/Focus24/Services/VP.svc/CopiaVP/" + vendapersonalizada.vpData[0].VPNumber, function(a) {
		                            var modal = new Modal();
		                            modal.open('VP ' + code + ' disponível para revisão!',"Novo número de VP: " + a, !1, vendapersonalizada.goHome);
			                    });
							}

							if ($('a.btn').attr('name') === 'cancel') {
	                            var modal = new Modal();
	                            modal.open('Proposta de VP ' + code + ' encerrada!',"Feche esta janela.", !1, vendapersonalizada.goHome);
							}
						}
					});
	        	});
	        },

		    /**
			    * Load the content that was inserted before in current page
			    * * Used webservices: VpList
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        vpListWriter: function(code) {
	        	var VPLIST = {
                    Aprovacao: "",
                    Cliente: "",
                    CodCliente:"",
                    CodRepre: "",
                    Data: "",
                    Gestor: "",
                    Representante: "",
                    Status: "",
                    VPNumber: code,
                    VPCode:"",
                    VPNumberBase: ""
                }

                $.ajax({
                    url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                    data: JSON.stringify(VPLIST),
                    type: 'POST',
                    contentType: "application/json; charset=utf-8",
                    traditional: true,
                    success: function(data) {
                        var retorno = JSON.parse(data);
                        retorno = JSON.parse(retorno[0].Aprovacao);
                        
                        vendapersonalizada.setIconsWorkFlow(retorno,code);
                        retorno = JSON.parse(retorno["Obs_"+$("form").attr("data-ref")]);

                        if (retorno) {
                        	$("form input[type='text']").each(function(index,el) {
			        			$(this).val(retorno[0][index]);
			        		});

			        		retorno[1].forEach(function(el,index) {
				        		$("#" + el).trigger("click");
				        	});

				        	$("form textarea").val(retorno[2]);

				        	if ($("form").find("select").length) {
                                $("form").find("select option[value='" + retorno[3] + "']").attr('selected','selected');
                                
                            }
                        }
                    },
                });
	        },

		    /**
			    * `Save the content of current page`
			    * * Used webservices: AlteracaoFluxo, AlteraStatusVP
			    * @param {String} code Return the VP number from URL
			    * @param {String} finish If the `finish` param is true, it will finish the approval flow (only called in `Fluxo de Aprovação -> Superintendência`) 
			    * @memberOf VendaPersonalizada#
		    */

	        saverWorkFlow: function(code,finish) {
	        	var array_aux = {
	        		Departamento:$("form").attr("name"),
					inputs:[],
					checks:[],
					textarea:$("form textarea").val(),
					selects:[],
					Status:$(".question_form input:checked").attr('data-code'),
					VPNumber:code
	        	}

	        	$("form input[type='text']").each(function() {
					array_aux.inputs.push($(this).val());
				});

				$("form input:checked").each(function() {
					array_aux.checks.push($(this).attr("id"));
				});

				if ($("form").find("select").length) {
                    array_aux.selects.push($("form").find("select option:selected").text());
                }

	        	var array = {
					Departamento:$("form").attr("name"),
                    Objeto:"["+JSON.stringify(array_aux.inputs)+","+JSON.stringify(array_aux.checks)+","+JSON.stringify(array_aux.textarea)+","+JSON.stringify(array_aux.selects)+"]",
					Status:$(".question_form input:checked").attr('data-code'),
					VPNumber:code
				}

				$.ajax({
					url: 'http://was-dev/Focus24/Services/VP.svc/AlteracaoFluxo/0',
					data: JSON.stringify(array),
					type: 'POST',
					contentType: "application/json; charset=utf-8",
					traditional: true,
					success: function(data) {
						if (finish) {
                            var modal = new Modal();
                            var arr = {
                                "Status":"",
                                "VPNumber":""
                            }

                            $.map(vendapersonalizada.icons, function(val, i) {
                                if (parseInt(array.Status) === val.id) {
                                    arr.Status = "" + val.name;
                                    arr.VPNumber = "" + code;
                                }
                            });

                            $.ajax({
                                url: 'http://was-dev/Focus24/Services/VP.svc/AlteraStatusVP/0',
                                data: JSON.stringify(arr),
                                type: 'POST',
                                contentType: "application/json; charset=utf-8",
                                traditional: true,
                                success: function(data) {
                                    modal.open('VP' + code + ' ' + $('input:checked').next().text() + '!',"Feche esta janela.", !1,vendapersonalizada.goHome);
                                },
                            });
                        } else {
                            var modal=new Modal();
                            modal.open('Salvo com sucesso!', "Feche esta janela.", !1, vendapersonalizada.redirectWorkFlow);
                        }
					},
				});
	        },

		    /**
			    * Load the worflow icons of `Fluxo de Aprovação`
			    * * Used webservices: VpList
			    * @param {Array} json Use this array as data source for set icons in `Fluxo de Aprovação`
			    * @param {String} code Return the VP number from URL
			    * @memberOf VendaPersonalizada#
		    */

	        setIconsWorkFlow: function(json,code) {
                var array = json;
                
                if (!json) {
                    var VPLIST = {
                        Aprovacao: "",
                        Cliente: "",
                        CodCliente:"",
                        CodRepre: "",
                        Data: "",
                        Gestor: "",
                        Representante: "",
                        Status: "",
                        VPNumber: code,
                        VPCode:"",
                        VPNumberBase: ""
                    }

                    $.ajax({
                        url: 'http://was-dev/Focus24/Services/VP.svc/VpList/0',
                        data: JSON.stringify(VPLIST),
                        type: 'POST',
                        contentType: "application/json; charset=utf-8",
                        traditional: true,
                        success: function(data) {
                            var retorno = JSON.parse(data);
                            retorno = JSON.parse(retorno[0].Aprovacao);  
                            var array = retorno;

                            $(".no_latbars li a").each(function(index,el) {
                                $.map(vendapersonalizada.icons, function(val, i) {
                                    if (array[$(el).attr("name")] === val.id) {
                                        $(el).find(".fa").attr("class","fa").addClass(val.classname);
                                    }
                                });
                            });
                        },
                    });
                } else {
                    $(".no_latbars li a").each(function(index,el) {
                        $.map(vendapersonalizada.icons, function(val, i) {
                            if (array[$(el).attr("name")] === val.id) {
                                $(el).find(".fa").attr("class","fa").addClass(val.classname);
                            }
                        });
                    });
                }   
            }
    	}

	    /**
		    * Provides the base of modal used in application
		    * @param {String} el Message that will be showed in modal
		    * @param {Boolean} buttons If true, the message will be in red (alert). If false, it will be blue (warning). 
		    * @param {Boolean} btnclose Page that will be redirect
		    * @memberOf VendaPersonalizada#
	    */

    	function Modal(el,buttons,btnclose) {
    		var self = this;
    		this.el = $("#modal");
    		this.buttons = $(".modal-buttons");
    		this.btnclose = $(".bclose");
    		this.callback = null;

    		this.btnclose.bind("click",function(a) {
    			self.close(a);
    		});
    		
    		this.open = function(title,msg,isbad,callback) {
    			this.el.find("h2").text(title);
    			this.el.find("p").text(msg);
    			if (callback && "function" === typeof callback)
      				this.callback = callback;
    			
    			if (isbad) {
    				this.el.addClass('bad');
    			} else {
    				this.el.removeClass("bad");
    			}
    			
    			this.el.fadeIn();
    		};

    		this.close=function(a) {
    			if ("object" === typeof a) {
			        a.preventDefault(), $(a.target);
			    }
			    
			    this.el.fadeOut();
			    this.callback && this.callback();
    		};
    	}

	    /**
		    * Determines the user profile and permissions
		    * * Used webservices: getPerfil
		    * @memberOf VendaPersonalizada#
	    */

    	function Perfil() {
    		var context = vendapersonalizada;
    		var self = this;
    		
    		this.getPerfil = function(txt) {
    			var tables = ["SolicitacaoVP","FluxoAprovacao","PropostaVP","ValidacaoPropostaVP"];
    			
    			if (context.usr.Nome === "TIWEB") {
    				txt = "Administrator";
    			}
		  		
		  		$.getJSON("http://was-dev/Focus24/Services/VP.svc/getPerfil/" + txt, function(a) {	   
				    context.usr.Perfil = a;
				    tables.forEach(function(el,index) {
				    	self.setPermissions(context.usr.Perfil["" + el],el);
				    })
			  	})
    		};

    		this.setPermissions=function(val,attr) {
				var iCria = 1;
				var iLer = 2;
				var iAltera = 4;
				var iValorServico = val; //Valor de retorno do Serviço

				iCria &= iValorServico 
				iLer &= iValorServico
				iAltera &= iValorServico

				$("body").addClass(attr + "Criar" + iCria);
				$("body").addClass(attr + "Ler" + iLer);
				$("body").addClass(attr + "Alterar" + iAltera);
    		};      	
        };

		vendapersonalizada.init();

		//setup crossroads
        crossroads.addRoute('/',function() {
        });

        crossroads.addRoute('/{type}',function(a) {
        	$('nav ul li ul.no_latbars').addClass('disabled');
            vendapersonalizada.load(a + "/inicial");
        });

        crossroads.addRoute('/{type}/{page}/{code}', function(a, b, c) {
        	var self = vendapersonalizada;
		    switch (a) {
                case "solicitacao":
                    vendapersonalizada.vpCode = c;
                    $('main nav > ul li').removeClass('active');
                    $('main nav > ul > li a[name="' + a + '"]').parent().addClass("active");
                    $("a[data-url='" + a + "/" + b + "']").parent().addClass("active");
                    //$(this).parent().addClass('active').parents('li').addClass('active');
                    
                    if (c === "new") {
                      $(".repre_name").text(vendapersonalizada.usr.Nome);
                    } else {
		        		var vpRepresentante = "http://was-dev/Focus24/Services/VP.svc/custumerAll/" + (self.usr.TIPO === "GESTOR" ? self.usr.VKBUR : self.usr.CodRepresentante);
				        $.getJSON(vpRepresentante +"?callback=?", function (dadosRetorno) {
				        	$.each(dadosRetorno, function() {
				        		var self = this;
				        		if (this.VPCode === c || this.VPNumber === c) {
	                      			$(".repre_name").text(vendapersonalizada.usr.Nome + " | VP Nº " + this.VPCode);
				        		}
				        	});
	                  	});
                    }

                    if (c !== "new") {
                        var vpCode = "http://was-dev/Focus24/Services/VP.svc/getVP/"+c;
                        $.getJSON(vpCode + "?callback=?", function (dadosRetorno) {
                            try {
                            	vendapersonalizada.vpCode = c;
                                vendapersonalizada.vpData = JSON.parse(dadosRetorno);
                                vendapersonalizada.load(a + "/" + b, c);
                            } catch (ex) {}
                        });
                    } else {
                        vendapersonalizada.load(a + "/" + b, c);
                    }
                break;
                case "fluxo":
                	$('main nav > ul li').removeClass('active');
                    $('main nav > ul > li a[name="' + a + '"]').parent().addClass("active");
                    $("a[data-url='" + a + "/" + b + "']").parent().addClass("active");
                    $('nav ul li ul.no_latbars').removeClass('disabled');
                    vendapersonalizada.vpData = [];
	                vendapersonalizada.vpCode = c;               
                    vendapersonalizada.load(a + "/" + b, c);
	        		var vpRepresentante = "http://was-dev/Focus24/Services/VP.svc/custumerAll/" + (self.usr.TIPO === "GESTOR" ? self.usr.VKBUR : self.usr.CodRepresentante)
			        
			        $.getJSON(vpRepresentante + "?callback=?", function (dadosRetorno) {
			        	$.each(dadosRetorno, function() {
			        		var self = this;
			        		if (this.VPCode === c) {
                      			$(".repre_name").text(vendapersonalizada.usr.Nome + " | VP Nº " + this.VPCode);
			        		}
			        	});
                  	});
                break;
                case "validacao":
                	vendapersonalizada.vpCode = c;
                    vendapersonalizada.load(a + "/" + b, c);
                break;
            }
        });
        //setup hasher
        function parseHash(newHash, oldHash) {
			crossroads.parse(newHash);
        }

        hasher.initialized.add(parseHash); //parse initial hash
        hasher.changed.add(parseHash); //parse hash changes
        hasher.init(); //start listening for history change
	})();
});