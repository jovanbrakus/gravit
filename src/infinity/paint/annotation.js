(function (_) {

    /**
     * @class GAnnotation
     * @constructor
     * @version 1.0
     */
    function GAnnotation() {
    };

    /**
     * Type of an annotation
     * @enum
     */
    GAnnotation.prototype.AnnotType = {
        Rectangle: 0,
        Circle: 1,
        Diamond: 2
    };

    var _annotationTemplates = {};

    /**
     * Paint an annotation
     * @param {GXPaintContext} context the paint context to paint on
     * @param {GTransform} transform the current transformation in use
     * @param {GPoint} center the center point of the annotation
     * @param {GAnnotation.AnnotType} annotation the annotation to be painted
     * @param {Boolean} [selected] whether the annotation should be painted
     * selected or not. Defaults to false.
     * @param {Number} [size] annotation size
     */
    GAnnotation.prototype.paintAnnotation = function (context, transform, center, annotation, selected, size) {
        var annotationTemplate = this._getAnnotationTemplate(annotation);

        // Now paint our annotation
        if (transform) {
            center = transform.mapPoint(center);
        }

        var fillColor = context.selectionOutlineColor;
        var strokeColor = gColor.build(255, 255, 255);
        if (selected) {
            fillColor = strokeColor;
            strokeColor = context.selectionOutlineColor;
        }

        var cx = Math.floor(center.getX()) + (selected ? 0.5 : 0);
        var cy = Math.floor(center.getY()) + (selected ? 0.5 : 0);
        var sx = size / 2 / annotationTemplate.scaleFactor;
        var sy = size / 2 / annotationTemplate.scaleFactor;
        var canvas = context.canvas;

        var vertices = new GXVertexTransformer(annotationTemplate.vertices, new GTransform(sx, 0, 0, sy, cx, cy));
        //if (annotation != this.AnnotType.Circle) {
        //    vertices = new GXVertexPixelAligner(vertices);
        //}
        canvas.putVertices(vertices);
        canvas.fillVertices(fillColor);
        // TODO : Transform and fill with stroke first, then fill to avoid expensive stroke operations for annotations at all
        if (selected) {
            canvas.strokeVertices(strokeColor, 1);
        }
    };


    /**
     * Get bbox of an annotation
     * @param {GTransform} transform the current transformation in use
     * @param {GPoint} center the center point of the annotation
     * @param {Number} [size] the size of an anotation
     */
    GAnnotation.prototype.getAnnotationBBox = function (transform, center, size) {
        if (transform) {
            center = transform.mapPoint(center);
        }

        var cx = Math.floor(center.getX()) + 0.5;
        var cy = Math.floor(center.getY()) + 0.5;

        return new GRect(cx - size / 2 - 1, cy - size / 2 - 1, size + 2, size + 2);
    };

    GAnnotation.prototype._getAnnotationTemplate = function (annotation) {
        // Prepare vertex cache, first
        var annotationTemplate = _annotationTemplates[annotation];
        if (!annotationTemplate) {
            var vertices = new GXVertexContainer();
            var scaleFactor = 1;

            switch (annotation) {
                case this.AnnotType.Rectangle:
                    vertices.addVertex(GXVertex.Command.Move, -1, -1);
                    vertices.addVertex(GXVertex.Command.Line, 1, -1);
                    vertices.addVertex(GXVertex.Command.Line, 1, 1);
                    vertices.addVertex(GXVertex.Command.Line, -1, 1);
                    vertices.addVertex(GXVertex.Command.Close);
                    break;

                case this.AnnotType.Circle:
                    vertices.addVertex(GXVertex.Command.Move, -1, 0);
                    vertices.addVertex(GXVertex.Command.Curve, 0, -1);
                    vertices.addVertex(GXVertex.Command.Curve, -1, -1);
                    vertices.addVertex(GXVertex.Command.Curve, 1, 0);
                    vertices.addVertex(GXVertex.Command.Curve, 1, -1);
                    vertices.addVertex(GXVertex.Command.Curve, 0, 1);
                    vertices.addVertex(GXVertex.Command.Curve, 1, 1);
                    vertices.addVertex(GXVertex.Command.Curve, -1, 0);
                    vertices.addVertex(GXVertex.Command.Curve, -1, 1);
                    break;

                case this.AnnotType.Diamond:
                    vertices.addVertex(GXVertex.Command.Move, -1, 0);
                    vertices.addVertex(GXVertex.Command.Line, 0, -1);
                    vertices.addVertex(GXVertex.Command.Line, 1, 0);
                    vertices.addVertex(GXVertex.Command.Line, 0, 1);
                    vertices.addVertex(GXVertex.Command.Close);
                    scaleFactor = Math.cos(Math.PI / 4);
                    break;
            }

            annotationTemplate = {
                vertices: vertices,
                scaleFactor: scaleFactor
            }
            _annotationTemplates[annotation] = annotationTemplate;
        }
        return annotationTemplate;
    };

    _.gAnnotation = new GAnnotation();
})(this);