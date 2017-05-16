//R2 Events production code
//r2 events.js
//var BASE_URL = 'http://r2soft.com.ng/anywork/';

var evt_origin = (function(){
    
    var listeners = {};

    return {
      on:function(evt,fn){

         if (typeof(listeners[evt]) == 'undefined'){
            listeners[evt] = [];
         }

         listeners[evt] = fn;

      },
      trigger:function(evt,data){

        if (typeof(listeners[evt]) != 'undefined'){

             listeners[evt]({},data);

             // $.each(listeners[evt],function(k,v){

             //   v({},data);

             // });

        }

      },
      get_listeners:function(){
        return listeners;
      }

    };

})();

var evt_attach = (function(){

  
   return function(evt_name,cb){

      //$(document).on(evt_name,cb);
      evt_origin.on(evt_name,cb);

   };


})();


var evt_trigger = (function(){
 

  return function(evt_name,data){

     //$(document).trigger(evt_name,data);
     evt_origin.trigger(evt_name,data);

  };


})();



var tpl_load = (function(){
    
    var tmpl_cache = {};
    
    function _TMP_FN_(tmpl){

      //evt_trigger(tmpl + '.before',tmpl);

      //console.log(tmpl);
      

      if (typeof(tmpl_cache[tmpl]) != 'undefined'){

        console.log('Called cache::',typeof(tmpl_cache[tmpl]));

        evt_trigger(tmpl,tmpl);

      }else{

        //console.log('Bool',typeof(tmpl_cache[tmpl]),tmpl,tmpl_cache);

        //console.log(tmpl_cache,tmpl_cache[tmpl],tmpl);
        
        var _url_ = url_ + 'templates/' + tmpl.split('.').join('/') + '.html';

        //console.log(_url_,url_);

          $.ajax({
            url:_url_,
            type:'get',
            success:function(dt){

              tmpl_cache[tmpl] = dt;

              //$('body').append(dt);
              
              evt_trigger(tmpl,tmpl);

            }
          });

      }

    };

    _TMP_FN_.get_template = function(id){

       return tmpl_cache[id];

    };

    return _TMP_FN_;

})();



var tpl_get = tpl_load; //alias.

var evt_ajax_call = (function(){
 

  return function(cfg){ //url, url_part,data

    var typ = cfg.type || 'post';

     $.ajax({
      url:cfg.url + cfg.url_part,
      type:typ,
      success:function(dt){
        evt_trigger(cfg.url,dt);
      }
     });

  };


})();



var evt_route_listener = (function(){

  
   return function(cfg){


     //$()



   };



})();



var mod_use = (function(){
 
  
  var script_track = {};


  return function(module,data_){

  	if (script_track[module]){

  		 evt_trigger(module,data_);

  	}else{


  	 $.ajax({
  	 	url: url_ + 'modules/' + module.split('.').join('/') + '.js',
  	 	type:'get',
  	 	success:function(dt){

  	 		 //var scrp = '<script type="text/javascript">' + dt + '</script>';

  	 		 //$('body').append(scrp);

         script_track[module] = 1;
         
         var fn = new Function('','(function(){' + dt + '})();');

         fn = fn();

  	 		 evt_trigger(module,data_);

  	 	}
  	 });



  	}


  }




})();


var tpl_parse = (function(){
 

   return function(template,data){

      var html = template;

      $.each(data,function(k,v){

         html = html.split('{' + k + '}').join(v);

      });

      return html;


   };


})();

//event, amd generators here start
var views_use_tpl = function(tpl,cb){

  return function(){

     evt_attach(tpl,cb);
    
     tpl_load(tpl);

  };

};

var views_use = function(deps,cb){
   
   var wrapper = views_use_tpl(deps[0],cb);

    $.each(deps,function(k,v){
      
       if (k > 0){

         wrapper = (function(wrp){
          return views_use_tpl(v,wrp);
         })(wrapper);

       }

    });

    wrapper();

};


var mods_use_tpl = function(mod,cb){
  
   return function(){

     evt_attach(mod,cb);
    
     mod_use(mod);

   };


};

var mods_use = function(deps,cb){
   
   var wrapper = mods_use_tpl(deps[0],cb);

    $.each(deps,function(k,v){
      
       if (k > 0){

         wrapper = (function(wrp){
          return mods_use_tpl(v,wrp);
         })(wrapper);

       }

    });

    wrapper();

};


var comp_use = function(cfg){
  views_use(cfg.views,function(){
    mods_use(cfg.modules,function(){
      cfg.cb();
    });
  });
};

//event, amd generators here stop




evt_attach('img.render',function(){
  $('[data-src]').each(function(){
   
    if (!$(this).data('data-src')){

       var data_src = $(this).data('src');

       $(this).attr('src',url_ + data_src);

       $(this).data('data-src',1);

    }

  });
});


evt_attach('data.validate',function(evt,data){
  
   

   $('[data-validate]').each(function(){

      
      var type_ = $(this).data('validate');    
      var vl = $(this).val();

      if (type_ == 'required'){

         if (vl == ''){

           data.errors.push({
            $el:$(this),
            msg:'Required'
           });

           $el.css('border','2px solid red');

         }else{

            $el.css('border','2px solid #eee');

         }

      }else if (type_ == 'number'){

         if (isNaN(vl)){

           data.errors.push({
            $el:$(this),
            msg:'Number Required'
           });

           $el.css('border','2px solid red');

         }else{

          $el.css('border','2px solid #eee');

         }

      }else if (type_ == 'email'){

         if (vl.split('@').length <= 1){

           data.errors.push({
            $el:$(this),
            msg:'E-mail Required'
           });

           $el.css('border','2px solid red');


         }else{

           $el.css('border','2px solid #eee');

         }

      }

   });


});




  evt_attach('data-collect',function(evt,data){

  
    data.$el.find('[data-name]').each(function(){

         var key = $(this).data('name');
         var vl = $(this).val();

         data.data[key] = vl;

    });



  });


  evt_attach('data-disperse',function(evt,data){

    $.each(data.data,function(k,v){

       data.$el.append('<input type="hidden" name="' + k + '" value="' + v + '" />'); 

    });


  });



  evt_attach('data-fill',function(evt,data){

    $.each(data.data,function(k,v){

       //data.$el.append('<input type="hidden" name="' + k + '" value="' + v + '" />'); 
       $('[data-name=' + k + ']').val(v);

    });


  });

