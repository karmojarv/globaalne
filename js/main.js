window.requestAnimFrame = (function(){
  return  window.requestAnimationFrame       || 
          window.webkitRequestAnimationFrame || 
          window.mozRequestAnimationFrame    || 
          window.oRequestAnimationFrame      || 
          window.msRequestAnimationFrame     || 
          function( callback ){
            window.setTimeout(callback, 1000 / 60);
          };
})();

(function (c, e) {
  function b() {
    this.currentLevel = this.scrolled = 0;
    this.levels = 0;
    this.distance3d = 3000;
    this.$window = c(window);
    this.$document = c(document);
    this.containerHeight = c("#container").height();
    this.getScrollTransform = e.csstransforms3d ? this.getScroll3DTransform : this.getScroll2DTransform;
    this.getAssignTransform = e.csstransforms3d ? this.getAssign3DTransform : this.getAssign2DTransform;
    this.getRotateTransform = e.csstransforms3d ? this.getRotate3DTransform : this.getRotate2DTransform;
    this.scrollDestination = this.$window.scrollTop();
    this.scrollCurrent = this.$window.scrollTop();
    this.scrollFrames = 4;

    // infinite scroll
    this.page = 1;
    this.loading = false;
    this.finished = false;
    this.loadingDiv = null;
    this.pinwheelZ = 0;

    e.csstransforms && window.addEventListener("scroll", this, false)
  }
  b.prototype.handleEvent = function (a) {
    if (this[a.type]) this[a.type](a)
  };
  b.prototype.getAssign2DTransform = function (a) {
    a = "scale(" + -1 * Math.pow(3, a * (this.levels - 1)) + ")";
    return {
    }
  };
  b.prototype.getScroll2DTransform = function (a) {
    a = "scale(" + Math.pow(3, a * (this.levels - 1)) + ")";
    return {
    }
  };
  b.prototype.getRotate2DTransform = function (z) {
    a = "rotate(" + z + "deg);";
    return {
      WebkitTransform: a,
      MozTransform: a,
      OTransform: a,
      transform: a
    }
  };
  b.prototype.getRotate3DTransform = function (z) {
    var transform = "rotateZ(" + z + "deg)";
    return {
      'transform':     transform,
      Otransform:      transform,
      MozTransform:    transform,
      WebkitTransform: transform
    }
  };
  b.prototype.getAssign3DTransform = function (a) {
    a = -1 * a * this.distance3d;
    var transform = "translate3d( 0, 0, " + a + "px )";
    return {
      'transform':     transform,
      Otransform:      transform,
      MozTransform:    transform,
      WebkitTransform: transform
    }
  };
  b.prototype.getScroll3DTransform = function (a) {
    a = a * (this.levels - 1) * this.distance3d;
    var transform = "translate3d( 0, 0, " + a + "px )";
    return {
      'transform':     transform,
      Otransform:      transform,
      MozTransform:    transform,
      WebkitTransform: transform
    }
  };
  b.prototype.scroll = function () {
    this.scrollDestination = this.$window.scrollTop();
  };
  b.prototype.start = function () {
    var self = this;
    (function animloop(){
      requestAnimFrame(animloop);
      self.animate();
    })();
  };
  b.prototype.avg = function (current, dest, frames) { 
    return ((frames * current + dest) / (frames + 1));
  };
  b.prototype.animate = function () {
    if (e.csstransforms3d && Math.abs(this.scrollDestination - this.scrollCurrent) > 1) {
      this.scrollCurrent = this.avg( this.scrollCurrent, this.scrollDestination, this.scrollFrames );
      this.scrolled = this.scrollCurrent / (this.$document.height() - this.$window.height());
      this.transformScroll(this.scrolled);
      nextLevel = Math.round( this.scrolled * (this.levels - 1));
      if (nextLevel !== this.currentLevel) {
        if (this.currentLevel > this.levels - 3) {
          this.infiniteScroll();
        }
        if (nextLevel > this.currentLevel) {
          var hides = $("section").splice(0, this.currentLevel - 1);
          $(hides).each(function(){$(this).hide()});
          var hides = $("section").splice(this.currentLevel + 2, this.levels - this.currentLevel - 2);
          $(hides).each(function(){$(this).hide()});
          var shows = $("section").splice(this.currentLevel + 1, 3);
          $(shows).each(function(){$(this).show()});
        } else {
          var hides = $("section").splice(this.currentLevel + 2, this.levels - this.currentLevel - 2);
          $(hides).each(function(){$(this).hide()});
          var shows = $("section").splice(Math.max(0, this.currentLevel-1), 2);
          $(shows).each(function(){$(this).show()});
        }
        this.currentLevel = nextLevel;
        d.populateAbout();
      }
    }
    if (this.loading) {
      this.pinwheelZ = (this.pinwheelZ + 5) % 360;
      this.$pinwheel.css(this.getRotateTransform(this.pinwheelZ));
    } else if (! e.csstransforms3d) {
      if (this.containerHeight > 1000 && this.scrollDestination > this.containerHeight - this.$window.height()) {
        this.infiniteScroll();
      }
    }
  };

  b.prototype.populateAbout = function (level) {
    level = level || this.currentLevel;
    var about = $("section").eq(level).children(".about").html();
    $("#hud").html(about);
  };
  b.prototype.transformScroll = function (a) {
    this.$content.css(this.getScrollTransform(a))
  };

  b.prototype.zoomIn = function () {
    this.currentLevel += 1;
    if (this.currentLevel >= this.levels)
      this.currentLevel = this.levels - 1;
    this.scrollDestination = this.currentLevel * (this.$document.height() - this.$window.height()) / (this.levels - 1);
    this.$window.scrollTop(this.scrollDestination);
  };
  b.prototype.zoomOut = function () {
    this.currentLevel -= 1;
    if (this.currentLevel < 0)
      this.currentLevel = 0;
    this.scrollDestination = this.currentLevel * (this.$document.height() - this.$window.height()) / (this.levels - 1);
    this.$window.scrollTop(this.scrollDestination);
  };

  b.prototype.infiniteScroll = function () {
    var self = this;
    if (self.loading || self.finished) {
      return;
    }
    self.$pinwheel.stop().fadeIn(100);
    self.page += 1;
    self.loading = true;
    self.loadingDiv = $("<div/>");
    self.loadingDiv.load("/page/" + self.page + " section", null, function(){ self.loadCallback() });
  };

  b.prototype.loadCallback = function () {
    var self = this;
    // console.log("LOADING NEXT PAGE ...");
    var $posts = self.loadingDiv.children("section");
    if ($posts.length) {
      self.stack($posts);
      self.$content.append($posts);
    } else {
      self.finished = true;
    }
    self.containerHeight = c("#container").height();
    self.$pinwheel.stop().fadeOut(200, function(){
      self.loading = false;
    });
  };

  b.prototype.init = function () {
    this.stack(this.$content.children("section"));
  };
  b.prototype.stack = function ($divs) {
    var self = this;
    $divs.each(function(){
      $(this).css(self.getAssignTransform(self.levels));
      $(this).show();
      self.levels += 1;
    });
    $("body").height(self.levels * self.distance3d);
    self.containerHeight = c("#container").height();
  };
  var d = new b;
  d.isIOS = !! ("createTouch" in document);
  c(function () {
    d.$pinwheel = c("#pinwheel");
    d.$content = c("#content");
    if (! e.csstransforms3d) {
      $("#hud_container").hide();
    }
    d.init();
    d.start();
    d.populateAbout();
    c("body").addClass(d.isIOS ? "ios" : "no-ios");
    $(".zoom-in").bind("click", function(){ d.zoomIn() });
    $(".zoom-out").bind("click", function(){ d.zoomOut() });
    document.querySelectorAll('a[href^="#text"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        x = this.getAttribute("href").slice(-2);
        $(document).scrollTop(x * 1000);
    });
});
  })
})(jQuery, window.Modernizr);

