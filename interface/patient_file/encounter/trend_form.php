<?php
/**
 * Trending script for graphing objects.
 *
 * @package OpenEMR
 * @link    http://www.open-emr.org
 * @author  Brady Miller <brady.g.miller@gmail.com>
 * @author  Rod Roark <rod@sunsetsystems.com>
 * @license https://github.com/openemr/openemr/blob/master/LICENSE GNU General Public License 3
 * @copyright Copyright (c) 2010-2017 Brady Miller <brady.g.miller@gmail.com>
 * @copyright Copyright (c) 2011 Rod Roark <rod@sunsetsystems.com>
 */

$special_timeout = 3600;
require_once("../../globals.php");

$formname = $_GET["formname"];
$is_lbf = substr($formname, 0, 3) === 'LBF';

if ($is_lbf) {
  // Determine the default field ID and its title for graphing.
  // This is from the last graphable field in the form.
    $default = sqlQuery(
        "SELECT field_id, title FROM layout_options WHERE " .
        "form_id = ? AND uor > 0 AND edit_options LIKE '%G%' " .
        "ORDER BY group_id DESC, seq DESC, title DESC LIMIT 1",
        array($formname)
    );
}

//Bring in the style sheet
?>

<?php require $GLOBALS['srcdir'] . '/js/xl/dygraphs.js.php'; ?>

<link rel="stylesheet" href="<?php echo $css_header;?>" type="text/css">
<link rel="stylesheet" href="<?php echo $GLOBALS['assets_static_relative']; ?>/modified/dygraphs-2-0-0/dygraph.css" type="text/css"></script>
<?php
// Hide the current value css entries. This is currently specific
//  for the vitals form but could use this mechanism for other
//  forms.
// Hiding classes:
//  currentvalues - input boxes
//  valuesunfocus - input boxes that are auto-calculated
//  editonly      - the edit and cancel buttons
// Showing class:
//  readonly      - the link back to summary screen
// Also customize the 'graph' class to look like links.
?>
<style>
  .currentvalues { display: none;}
  .valuesunfocus { display: none;}
  .editonly      { display: none !important;}

  .graph {color:#0000cc;}

  #chart {
    margin:0em 1em 2em 2em;
  }
</style>

<script type="text/javascript" src="<?php echo $GLOBALS['assets_static_relative']; ?>/jquery-1-7-2/jquery.min.js"></script>
<script type="text/javascript" src="<?php echo $GLOBALS['assets_static_relative']; ?>/modified/dygraphs-2-0-0/dygraph.js?v=<?php echo $v_js_includes; ?>"></script>

<script type="text/javascript">


// Show the selected chart in the 'chart' div element
function show_graph(table_graph, name_graph, title_graph)
{
    top.restoreSession();
    $.ajax({ url: '../../../library/ajax/graphs.php',
    type: 'POST',
        data: ({
            table: table_graph,
              name: name_graph,
              title: title_graph
        }),
        dataType: "json",
        success: function(returnData){

        g2 = new Dygraph(
            document.getElementById("chart"),
            returnData.data_final,
            {
                title: returnData.title,
                delimiter: '\t',
                xRangePad: 20,
                yRangePad: 20,
                width: 480,
                height: 320,
                xlabel: xlabel_translate
            }
        );

            // ensure show the chart div
            $('#chart').show();
        },
        error: function() {
            // hide the chart div
          $('#chart').hide();
          if(!title_graph){
              alert("<?php echo xlt('This item does not have enough data to graph');?>" + ".\n" +"<?php echo xlt('Please select an item that has more data');?>" + ".");
          }
          else {
              alert(title_graph + " " + "<?php echo xlt('does not have enough data to graph');?>" + ".\n" + "<?php echo xlt('Please select an item that has more data');?>" + ".");
          }
          
        }
    });
}

$(document).ready(function(){

  // Use jquery to show the 'readonly' class entries
  $('.readonly').show();

  // Place click callback for graphing
<?php if ($is_lbf) { ?>
  // For LBF the <td> has an id of label_id_$fieldid
  $(".graph").click(function(e){ show_graph('<?php echo $formname; ?>', this.id.substring(9), $(this).text()) });
<?php } else { ?>
  $(".graph").click(function(e){ show_graph('form_vitals', this.id, $(this).text()) });
<?php } ?>

  // Show hovering effects for the .graph links
  $(".graph").hover(
    function(){
         $(this).css({color:'#ff5555'}); //mouseover
    },
    function(){
         $(this).css({color:'#0000cc'}); // mouseout
    }
  );

  // show blood pressure graph by default
<?php if ($is_lbf) { ?>
<?php if (!empty($default)) { ?>
  show_graph('<?php echo $formname; ?>','<?php echo $default['field_id']; ?>','<?php echo $default['title']; ?>');
<?php } ?>
<?php } else { ?>
  show_graph('form_vitals','bps','');
<?php } ?>
});
</script>

<?php
if ($is_lbf) {
  // Use the List Based Forms engine for all LBFxxxxx forms.
    include_once("$incdir/forms/LBF/new.php");
} else {
  // ensure the path variable has no illegal characters
    check_file_dir_name($formname);

    include_once("$incdir/forms/$formname/new.php");
}
?>
