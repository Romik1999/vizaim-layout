/**
 * @var $form is jquery element
 * @constructor
 */
function Calc($form, loanPeriods = [], loanSumIntervals = {}, interestRate = 0) {
    this.$form = $form;
    this.$formSelectorPrefix = $form.attr('data-selector-prefix');
    // form amount input slider
    this.$formAmountInput = $form.find('input[name*="amount"]');
    // form term input
    this.$formTermInput = $form.find('input[name*="term"]');
    // term slider
    this.$amountSlider = $form.find('.' + this.$formSelectorPrefix + '__amount-slider');
    // term slider
    this.$termSlider = $form.find('.' + this.$formSelectorPrefix + '__term-slider');
    // amount display
    this.$amountDisplay = $('.tpl-amount-display');
    this.$termDisplay = $('.tpl-term-display');
    this.$overpaymentDisplay = $('.tpl-overpayment-display');
    this.$returnAmountDisplay = $('.tpl-return-amount-display');
    this.$approvalProbabilityDisplay = $('.tpl-approval-probability-display');

    this.oldAmount = 0;
    this.oldTerm = 0;
    this.minAmount = this.$amountSlider.attr('min');
    this.maxAmount = this.$amountSlider.attr('max');
    this.amountStep = this.$amountSlider.attr('step');
    this.minTerm = this.$termSlider.attr('min');
    this.maxTerm = this.$termSlider.attr('max');
    this.termStep = this.$termSlider.attr('step');

    this.periods = loanPeriods;
    this.sumIntervals = loanSumIntervals;
    this.interestRate = interestRate;
}

Calc.prototype.init = function () {
    var self = this;
    var termStep = self.convertTermDaysToSteps(self.$formTermInput.val());
    self.$termSlider.val(termStep);

    var minusSumBtnSelector = '.' + self.$formSelectorPrefix + '__minus-amount-btn';
    var plusSumBtnSelector = '.' + self.$formSelectorPrefix + '__plus-amount-btn';
    var minusTermBtnSelector = '.' + self.$formSelectorPrefix + '__minus-term-btn';
    var plusTermBtnSelector = '.' + self.$formSelectorPrefix + '__plus-term-btn';

    this.$amountSlider.on('change', function () {
        self.recalculate();
    });
    this.$amountSlider.on('input', function () {
        self.recalculate();
    });
    this.$termSlider.on('change', function () {
        self.recalculate();
    });
    this.$termSlider.on('input', function () {
        self.recalculate();
    });
    this.$amountSlider.rangeslider({
        polyfill: false
    });
    this.$termSlider.rangeslider({
        polyfill: false
    });
    this.$amountDisplay.each(function () {
        if ($(this).is('input')) {
            $(this).on('change', function () {
                self.recalculate();
            });
            $(this).on('keydown', function (event) {
                if (event.keyCode === 13) {
                    event.preventDefault();
                    $(this).trigger('change');
                    $(this).trigger('blur');
                }
            });
        }
    });

    this.oldAmount = this.$amountSlider.val();
    this.oldTerm = this.$termSlider.val();
    if (typeof this.oldTerm === 'undefined') {
        this.oldTerm = this.convertTermDaysToSteps(this.$termDisplay.text());
    }
    this.recalculate();

    this.$form.find(minusSumBtnSelector).on('click', function () {
        if (+self.$amountSlider.val() > +self.minAmount) {
            self.$amountSlider.val(+self.$amountSlider.val() - +self.amountStep);
            self.recalculate();
        }
    });

    this.$form.find(plusSumBtnSelector).on('click', function () {
        if (+self.$amountSlider.val() < +self.maxAmount) {
            self.$amountSlider.val(+self.$amountSlider.val() + +self.amountStep);
            self.recalculate();
        }
    });

    this.$form.find(minusTermBtnSelector).on('click', function () {
        if (+self.$termSlider.val() > +self.minTerm) {
            self.$termSlider.val(+self.$termSlider.val() - +self.termStep);
            self.recalculate();
        }
    });

    this.$form.find(plusTermBtnSelector).on('click', function () {
        if (+self.$termSlider.val() < +self.maxTerm) {
            self.$termSlider.val((+self.$termSlider.val()) + +self.termStep);
            self.recalculate();
        }
    });
};

Calc.getApprovalPercent = function (currentSum, periodIndex, sumInterval) {
    var result = 0;
    for (const sum in sumInterval) {
        if (sumInterval.hasOwnProperty(sum)) {
            if (+currentSum <= +sum) {
                result = sumInterval[sum][+periodIndex].approvalPercent;
                break;
            }
        }
    }
    return result;
};

Calc.formatSum = function (sum) {
    return (sum || 0).toString().replace(/(\d)(?=(\d{3})+(\D|$))/g, '$1 ');
};

Calc.prototype.clearSum = function (string) {
    var inputSum = string || '';
    var regex = new RegExp('[^0-9]', 'g');
    inputSum = inputSum.replace(regex, '');
    if (inputSum.length === 0) {
        inputSum = this.oldSum;
    }
    if (+inputSum < +this.minSum) {
        inputSum = this.minSum;
    }
    if (+inputSum > +this.maxSum) {
        inputSum = this.maxSum;
    }
    return inputSum;
};

Calc.prototype.sliderTermText = function (term) {
    // display text term
    var termText = '1 год';
    var sliderTermMod = term % 100;

    if (sliderTermMod >= 5 && sliderTermMod <= 20) {
        termText = term + " лет";
    } else if (sliderTermMod) {
        sliderTermMod = term % 10;

        if (sliderTermMod === 1) {
            termText = term + " год";
        } else if (sliderTermMod >= 2 && sliderTermMod <=4) {
            termText = term + " года";
        } else {
            termText = term + " лет";
        }
    }

    return termText;
}

Calc.prototype.convertTermStepsToDays = function (term) {
    // zero is first time init value
    if (parseInt(term) === 0) {
        term = 10;
    }
    return parseInt(term)*365;
}

Calc.prototype.convertTermDaysToSteps = function (term) {
    // zero is first time init value
    if (parseInt(term) === 0) {
        term = 3650; // 10 years
    }
    return parseInt(term)/365;
}

Calc.prototype.calculateOverpayment = function (amount) {
    return parseInt(amount)/100 * this.interestRate;
}

Calc.prototype.recalculate = function () {
    // Disable recalculate if it is in process
    if (this.isRecalculating === true) {
        return;
    }

    // Collect Data
    var sliderAmount = this.$amountSlider.val();
    var inputSum = this.clearSum(this.$amountDisplay.filter('input').val());
    var newAmount = inputSum === this.oldAmount ? sliderAmount : inputSum;
    if (typeof inputSum === 'undefined') {
        newAmount = sliderAmount;
    }

    var term = this.$termSlider.val();
    if (typeof term === 'undefined') {
        term = this.oldTerm;
    }
    var overpayment = this.calculateOverpayment(newAmount);
    var returnAmount = parseInt(newAmount) + parseInt(overpayment);
    var termDisplay = this.sliderTermText(term);

    this.isRecalculating = true;
    this.oldAmount = newAmount;
    $('.' + this.$formSelectorPrefix + '__amount-slider').val(newAmount).change();
    $('.' + this.$formSelectorPrefix + '__term-slider').val(term).change();

    var periodIndex = 0;
    if (this.periods.length > 0) {
        periodIndex = this.periods.find(function (value) {
            return +term <= value;
        });
    }

    // fill in data
    var self = this;
    this.$amountDisplay.each(function () {
        var elem = $(this);
        if (elem.is('input')) {
            elem.val(self.constructor.formatSum(newAmount))
        } else {
            elem.text(self.constructor.formatSum(newAmount));
        }
    });
    this.$formAmountInput.val(parseInt(newAmount));
    this.$formTermInput.val(this.convertTermStepsToDays(term));
    this.$termDisplay.text(termDisplay);
    this.$overpaymentDisplay.text(this.constructor.formatSum(overpayment));
    this.$returnAmountDisplay.text(this.constructor.formatSum(returnAmount));
    this.$approvalProbabilityDisplay.text(Calc.getApprovalPercent(newAmount, periodIndex, this.sumIntervals) + '%');

    this.isRecalculating = false;
};
