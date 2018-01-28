var info = `<pre>
<strong>Text format should be:</strong>

# comments start with "#"
# nodes first
NODE    X       Y
N001    478.00  5.00
N002    376.00  8.00
N003    134.00  9.00
# ... ...

# edges after
EDGE    O       D
E001    N001    N002
E002    N001    N007
E003    N001    N009
# ... ...
</pre>
`; // var info = ` ... `;

/**
 * Define new function of set text area selection range
 */
$.fn.selectRange = function(start, end) {
    end = end ? end: start;
    return this.each(function() {
        if('selectionStart' in this) {
            this.selectionStart = start;
            this.selectionEnd = end;
        } else if(this.setSelectionRange) {
            this.setSelectionRange(start, end);
        } else if(this.createTextRange) {
            var range = this.createTextRange();
            range.collapse(true);
            range.moveEnd('character', end);
            range.moveStart('character', start);
            range.select();
        } // if ... else if ...
    }); // return this.each(function() { ... });
}; // $.fn.selectRange = function(start, end) { ... };

/**
 * Setup: the pop over event for the info icon
 */
$(document).ready(function() {
    $('[data-toggle="popover"]').popover({ html:true });
    $('[data-toggle="popover"]').attr('data-content', info);
    $('#text').focus();
    $('#text').selectRange(0);
    $('#text').scrollTop(0);
    $('#text').scrollLeft(0);
}); // $(document).ready(function() { ... });

/**
 * Clear text area when "clear" is clicked
 */
$('#clear').click(function() {
    $('#text').val('');
    $('#tbody').empty();
}); // $('#clear').click(function() { ... });

/**
 * Save when "save" is clicked
 */
$('#save').click(function() {
    $('#text').focusout();
    saveSvg(function(result) {
        $('#response').text(result);
    }); // saveSvg(function() { ... });
}); // $('#save').click(function(result) { ... });

/**
 * Parse text and update table when text area losts focus
 */
$('#text').focusout(function() {
    updateTable();
}); // $('#text').focusout(function() { ... });

/**
 * Set modal dialog auto disappear
 */
$('#message').on('show.bs.modal', function () {
    setTimeout(function() {
        $('#message').modal('hide');
        $('#response').text('');
    }, 2000); // setTimeout(function() { ... }, ... );
}); // $('#message').on('show.bs.modal', function () { ... });
