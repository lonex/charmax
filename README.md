
Given a set of stylesheet property configuration, this returns a number that indicates the maximum number of characters that can be displayed in the browser <p> element defined with the stylesheet property.

Two phase approach
------------------

In order to make the service available, it has to be trained first. The input paramerters for the train is provided in *css_attrs.json*.
Run the following to train it, and the result would be saved into a plain text file under *db* folder. 

    > node lib/train.js

The next step, you can query the database for the result. E.g.

    > node lib/guess.js '{"font-weight": "normal", "font-size": "13px", "line-height" : "1.4", "font-family": "Times New Roman", "width": "200px", "height":"60px" }'
    => [157]  

Install
-------

Nodejs and phantomjs are required. For phantomjs, use the [npm wrapper](https://www.npmjs.org/package/phantomjs). When in the root folder of the project, 
    
    > node install

Phantomjs
---------

The system uses [Phantomjs](https://github.com/ariya/phantomjs) for the calculation. The nodejs code is merely a facade to use phantomjs during the training.
   For debugging purposes, there is an direct interface to the phantomjs code:

    > phantomjs lib/inline_render.js /absolute_path_to_project/build/fv.normal_fw.normal_fs.12px_lw.1.6_ff.timesnewroman_w.200px_h.60px.html ""

   The *fv.normal_fw.normal_fs.12px_lw.1.6_ff.timesnewroman_w.200px_h.60px.html* file is generated as a temporary file during the training. The html file is templated against *static/ad.jade*


