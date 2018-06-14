(require 'websocket)


(defun etw-keypress-do (k)
  (cond ((equal (key-binding (kbd k)) #'self-insert-command) (insert (if (equal k "SPC") " " k)))
        (t (call-interactively (key-binding (kbd k))))))

(defvar etw-kp-buf "")

(defun etw-keypress (k)
  (if (and (listp (key-binding (kbd k)))
           (equal (car (key-binding (kbd k))) 'keymap))
      (progn
        (setf etw-kp-buf (format "%s %s" etw-kp-buf k))
        (message "hmmm"))
    (progn
      (etw-keypress-do (if (> (length etw-kp-buf) 0) (format "%s%s" etw-kp-buf k) k))
      (setf etw-kp-buf "")
      )))

(defun etw-bl-join (a b) (format "%s,%s" a b))

(defun etw-bl ()
  (format "[%s]" (cl-reduce #'etw-bl-join (mapcar (lambda (b) (format "\"%s\"" b)) (buffer-list)))))

(defun emacs-training-wheels--eval-cb (a1 a2)
  "Handle A1 and A2."
  (websocket-send-text
   a1
   ;; (save-window-excursion)
   ;; (save-excursion)
   (format "%s" (eval (car (read-from-string (websocket-frame-text a2)))))))

(defun etw-main ()
  (interactive)
  "Begin a websocket server for this madness."
  (websocket-server
   55443
   :on-message
   (lambda (a1 a2)
     ;; Just run/eval whatever we receive and send it back as a string.
     ;; (print a1)
     ;; (print (websocket-frame-text a2))
     (emacs-training-wheels--eval-cb a1 a2))))
