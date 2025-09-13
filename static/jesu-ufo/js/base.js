$(document).ready(function() {
    const defaultOptions = {duration: 4000, showClose: true, showProgress: true, position: 'top-right'},
        iconMap = {
            success: '<i class="fas fa-check"></i>',
            error: '<i class="fa fa-times"></i>',
            warning: '<i class="fa fa-exclamation-triangle"></i>',
            info: '<i class="fa fa-exclamation-circle"></i>'
        };

    function createToast(type, title, message, options) {
        const opts = $.extend({}, defaultOptions, options);
        const toastId = 'toast_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const toastHtml = `<div class="toast ${type}"id="${toastId}"><div class="toast-icon">${iconMap[type] || iconMap.info}</div><div class="toast-content">${title ? `<div class="toast-title">${title}</div>` : ''}<div class="toast-message">${message}</div></div>${opts.showClose ? '<button class="toast-close" onclick="closeToast(\'' + toastId + '\')">&times;</button>' : ''}${opts.showProgress ? `<div class="toast-progress"style="animation-duration: ${opts.duration}ms;"></div>` : ''}</div>`;
        return {id: toastId, html: toastHtml, duration: opts.duration}
    }

    function toast(type, title, message, options) {
        const toast = createToast(type, title, message, options);
        const $container = $('#toastContainer');
        if ($container.length === 0) {
            $('body').append('<div class="toast-container" id="toastContainer"></div>');
        }
        $('#toastContainer').append(toast.html);
        const $toast = $('#' + toast.id);
        setTimeout(() => {
            $toast.addClass('show');
        }, 10);
        if (toast.duration > 0) {
            setTimeout(() => {
                closeToast(toast.id);
            }, toast.duration);
        }
        return toast.id;
    }

    window.closeToast = function (toastId) {
        const $toast = $('#' + toastId);
        if ($toast.length) {
            $toast.removeClass('show');
            setTimeout(() => {
                $toast.remove();
            }, 300);
        }
    };

    // 导航栏手风琴效果
    $('.hamburger').click(function() {
        $('.nav-menu').toggleClass('active');
        $(this).find('i').toggleClass('fa-bars fa-times');
    });

    // 点击导航链接关闭菜单
    $('.nav-link').click(function() {
        $('.nav-menu').removeClass('active');
        $('.hamburger').find('i').removeClass('fa-times').addClass('fa-bars');
    });

    // 搜索功能
    $('.search-box input').on('input', function() {
        const searchText = $(this).val().toLowerCase();
        const activeCategory = $('.category-tab.active').data('category');

        $('.product-item').each(function() {
            const title = $(this).find('.p-title').text().toLowerCase();
            const category = $(this).data('category');
            const matchesSearch = title.includes(searchText);
            const matchesCategory = activeCategory === 'all' || category === activeCategory;

            if (matchesSearch && matchesCategory) {
                $(this).show();
            } else {
                $(this).hide();
            }
        });
    });

    $(".category-tab").click(function() {
        var $this = $(this);
        $('.category-tab').removeClass('active');
        $this.addClass('active');
        if($this.attr('id') === 'cid-0'){
            $('.product-item').show();
        }else{
            $('.product-item').hide();
            $('.product-item.'+ $this.attr('id')).show();
        }
    });

    // 平滑滚动到锚点
    $('a[href^="#"]').on('click', function(e) {
        e.preventDefault();

        const target = this.hash;
        const $target = $(target);

        $('html, body').animate({
            'scrollTop': $target.offset().top - 80
        }, 800, 'swing');
    });

    // 定义地址映射
    const addresses = {
        'USDT-TRC20': 'TFzU2K26dytGCMPw8Wijw4BQzRnQN5M7vM',
        'USDT-ERC20': '0x91Feb31AD8B9F7228dB6B185d98a7F48eD83FCBe',
        'USDT-BEP20': '0x91Feb31AD8B9F7228dB6B185d98a7F48eD83FCBe',
        'USDT-SOL': 'HC7g4dgXWGviTJu7SmE9m5ySo6BLqTzitoo4iemnF8Cf'
    };

    // 数量增减功能
    $('#decrease-quantity').on('click', function () {
        const $quantityInput = $('#quantity');
        let value = parseInt($quantityInput.val());
        if (value > 1) {
            $quantityInput.val(value - 1);
            updateTotalPrice();
        }
    });

    $('#increase-quantity').on('click', function () {
        const $quantityInput = $('#quantity');
        let value = parseInt($quantityInput.val());
        if (value < 1000) {
            $quantityInput.val(value + 1);
            updateTotalPrice();
        }
    });

    // 输入框变化时更新总价
    $('#quantity').on('input', function () {
        let value = parseInt($(this).val());
        if (isNaN(value) || value < 1) {
            $(this).val(1);
        } else if (value > 1000) {
            $(this).val(1000);
        }
        updateTotalPrice();
    });

    function isValidEmail(email) {
        var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // 打开弹层
    $('#open-modal').on('click', function () {
        // 验证邮箱
        const email = $('#email').val();
        if(!email || !isValidEmail(email)){
            $('#email').focus();
            toast('error', '', '请输入正确的邮箱地址');
            return;
        }

        updateTotalPrice();
        updatePaymentAddress('USDT-TRC20');

        // 显示弹层
        $('#payment-modal').show();
        $('body').css('overflow', 'hidden');
    });

    // 关闭弹层
    $('#close-modal').on('click', function () {
        $('#payment-modal').hide();
        $('body').css('overflow', 'auto');
    });

    // 点击弹层外部关闭
    $(window).on('click', function (event) {
        if ($(event.target).is('#payment-modal')) {
            $('#payment-modal').hide();
            $('body').css('overflow', 'auto');
        }
    });

    // 更新总价
    function updateTotalPrice() {
        const qele = $('#quantity'),
            quantity = parseInt(qele.val()) || 1,
            price = parseFloat(qele.attr('data-price')),
            total = price * quantity;
        $('#modal-total').text(`$${total.toLocaleString()}`);
    }

    $('.payment-method').on('click', function () {
        $('.payment-method').removeClass('active');
        $(this).addClass('active');
        const methodName = $(this).find('.payment-name').text();
        updatePaymentAddress(methodName);
    });

    // 更新支付地址
    function updatePaymentAddress(method) {
        const address = addresses[method] || addresses['USDT-TRC20'];
        const qrImage = $('#qr-image');
        $('#payment-address').text(address);
        qrImage.empty();
        if(typeof QRCode !== "undefined"){
            new QRCode('qr-image', {
                text: addresses[method],
                width: 180,
                height: 180,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        }
        $('.copy-btn').attr('data-clipboard-text', addresses[method]);
    }

    if(typeof ClipboardJS !== 'undefined'){
        var clipboard = new ClipboardJS('.copy-btn');
        clipboard.on('success', function (e) {
            toast('success', '', '复制充值地址成功');
            e.clearSelection();
        });
    }
});