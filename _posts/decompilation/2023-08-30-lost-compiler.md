---
layout: post
title:  Synthesizing the Forgotten SNES C Compiler
date:   2023-08-30
categories: decompilation
usemathjax: true
---

# Introduction

Underneath the Nintendo brand is a [complex ecosystem](https://hardcoregamer.com/features/a-brief-history-of-nintendo-restructuring-their-development-teams/298405/) of research teams and partner firms that develop in-house tools and hardware for Nintendo's products. Often, many of the tools and hardware used during the development of their systems and first-party titles are [repackaged](https://www.gamedeveloper.com/business/q-a-design-lessons-learned-from-a-decade-at-nintendo-s-ead#close-modal) for third-party developers. However, in some cases, it will be years before that technology has a chance to peek out from behind the curtains.

There has been [speculation](https://forums.nesdev.org/viewtopic.php?t=12330) that some first-party SNES titles were written in C, but no official compiler was ever released to developers for the 65C816 chip. If such a compiler existed, it would have been written just 5 years after GCC and be a unique snapshot of early compiler design. Compiler enthusiasts rejoice, as evidence has recently been unearthed that confirmed the existence of "SFCC" -- and a hint at a way to synthesize this program from an unexpected source.

## Intelligent Systems

Intelligent Systems is one of Nintendo's business partners which has been responsible for engineering comprehensive development kits since the release of the NES, both internally and to third-parties.

![](assets/IS_Devkit.jpg)

In its early days, Intelligent Systems designed prototyping hardware, debuggers, asset pipelines, and everything else necessary to bring a game to term for a particular system. But after the switch from 8/16bit to more advanced hardware, the IS development environment went through substantial changes. As the industry was rapidly maturing, Intelligent Systems was able to lean heavily on off-the-shelf solutions as opposed to costly hand-rolled solutions.

During the transitional period between the release of the SNES and N64, Nintendo released the Virtual Boy, which had a [mixture of 2D and 3D technology](https://www.copetti.org/writings/consoles/virtual-boy/). Assembly programming was the foundation of 8 bit microprocessors, but all signs pointed to C as the herald of the 3D era. So, alongside their typical assembler and linker, they also provided a mysterious compiler!

## VUCC

![](assets/disk.jpg)

VUCC was a compiler for the Virtual Boy available to developers upon request. It is the only known C compiler published by Nintendo themselves, and was only distributed once.

The only information on the front of the floppy disk, besides its name, is a build version and the Intelligent Systems branding. Inspecting the executable reveals a bit more -- Copyright strings can be found for three companies: `Nintendo, Intelligent Systems, HAL Laboratory`. There is no mention of HAL Laboratory anywhere else 🤔.

[New evidence](https://web.archive.org/web/20170531070139/http://cl-www.msi.co.jp/reports/wblcl.pdf) has linked VUCC to an experimental compiler called SFCC, built years earlier for the SNES. SFCC was written by Seika Abe, who worked at HAL Laboratory as a recent graduate, enabling the company to program large parts of EarthBound, SimCity, and other games in C. Abe later left HAL to pursue a PhD and wrote his [dissertation](http://gakui.dl.itc.u-tokyo.ac.jp/data/h18/121742/121742a.pdf) on re-targetable compilers (the technology behind SFCC).

## Technical Specifications

At the core of the compiler are two programs: CPARSE and CGRIND. Both programs are built on top of [KCL](https://en.wikipedia.org/wiki/Kyoto_Common_Lisp), an early Lisp implementation.


```
files  
├── CGRIND.CL  
├── CGRIND.EXE  
├── CPARSE.CL  
├── CPARSE.EXE  
├── GMAIN.CL  
├── JUNCPP.EXE  
├── LD-V810.CL  
├── MD-V810.CL  
├── MD-V810M.CL  
├── MD-V810P.CL  
├── MD-V810S.CL  
├── OPTIMIZE.DOC  
├── PMAIN.CL  
├── SAMPLE  
├── TREE-LIB.CL  
├── VUCC.EXE  
└── VUCC.VER
```

CPARSE and CGRIND are accompanied by several Lisp files. Unfortunately, it seems like these files are not in an accessible format right away and they are unreadable when viewing. But it was promptly [figured out](https://www.virtual-boy.com/forums/t/format-of-cl-files-used-by-vucc/) that these files use a simple XOR encryption.

Decrypting the files reveals that the compiler's code generation is actually compartmentalized into various external Lisp scripts.

```lisp
(defcode epilogue (epilogue)
  (gen nil
    (progn
      (unless *cfun-is-leaf-p*
        (emit-mcode (list 'ld.w (list 'sp (list 'sub *mdl-frame-size* 4)) 'lp)))
      (unless (zerop *mdl-hreg-save-area-size*)
        (let ((off *mdl-hreg-save-area*))
          (dolist (reg *cfun-hreg-list*)
            (emit-mcode (list 'ld.w (list 'sp (posincf off 4)) reg)))))
      (unless (zerop *mdl-frame-size*)
        (emit-mcode (list 'add (list 'i4 *mdl-frame-size*) 'sp))))
      (jmp (dx 0 lp)))))

```

<figcaption> Here is an excerpt from one of the Lisp scripts. There are no comments in any of the files and many of the symbol names are hard to understand.</figcaption>

After the decryption, the CGRIND and CPARSE seem to no longer be able to read the Lisp files. I wonder if there's a way around this? Poking around CGRIND in IDA Pro shows that our environment must have `NOCRYPTLOAD` defined.

```c
// nodump is always on
      nodump_on = memq(&nodump, features) != nil;
      if ( nodump_on && !getenv("NOCRYPTLOAD") )
        set_crypt_loading();
// ...
        v13 = cstr0_to_string("cgrind.cl");
        v14 = load(v13);
```

## CPARSE

CPARSE is the front-end of the compiler. It parses source code into a [Register Transfer Language (RTL)](https://en.wikipedia.org/wiki/Register_transfer_language). CPARSE outputs the RTL in an SCO file, perhaps meaning "Symbolic Code Object".

For example, take the following declarations:

```c
int myGlobalInt;

void incrementer() {
    myGlobalInt++;
}
```

CPARSE will output the following:

```lisp
(variable "myGlobalInt" global nil i4 i4 "bss" (align 4))
(variable "incrementer" global nil (function nil void) i4 "text" (align 2 (R 0 12)))
(value (R 0 11) (block nil (posf i4 (add i4 (get i4 (R 0 10)) (const i4 1)))))
```

And as reference, here is an abbreviated version of GCC's RTL output of the same code:

```lisp
(set (reg:SI 82) (mem/c:SI (symbol_ref:DI ("myGlobalInt"))))
(set (reg:SI 83) (plus:SI (reg:SI 82) (const_int 1)))
(set (mem/c:SI (symbol_ref:DI ("myGlobalInt"))) (reg:SI 83))
```

CPARSE has an associated language definition (LD-V810.CL) Lisp script, which allows for many front-end parameters (integral types, function alignment, string element type, etc.) to be modified.
## CGRIND

CGRIND is the back-end of the compiler. It transforms the intermediate representation generated by CPARSE into a target-specific language to be assembled into a program.

Almost all of CGRINDs functionality depends upon an associated machine definition (MD-V810.CL) file. This is where registers and instructions are defined, and also where the actual code generation and optimizations take place.

Within CGRIND.CL we can find some interesting details about this compiler:

```lisp
(defun sfcc (ccodef) (test-cgrind ccodef "cparse-65816" "md-65816.cl" "-usefulenum"))

(defun vucc (ccodef &optional debug)
  (if debug (Nall))
  (test-cgrind ccodef "cparse-v810" "md-v810.cl"
    (format nil "-pedanticenum %s %s" (if debug "-g" "") "-gp 05008000")))

(defun fxcc (ccodef) (test-cgrind ccodef "cparse-fx" "md-fx.cl"))

(defun gbcc (ccodef) (test-cgrind ccodef "cparse-gb" "md-gb.cl" "-byteop"))
```

It appears that this compiler was tested not only for SNES, but also its sibling "SuperFX" chip as well as the GameBoy!
## Rewriting the front-end for SNES

As I mentioned earlier, this compiler was part of the toolchain for EarthBound, SimCity, and a few other SNES games. Referencing the code EarthBound has been insightful, and tells us a lot about how SFCC was implemented. For example, rudimentary stack frames were established for functions with local variables using the Direct Page registers, and loop unrolling can be found in several subroutines.

I currently have a work in progress restoration of SFCC [here](https://github.com/notyourav/vucc/blob/sfc/MD-V810.cl). While it is not complete, a significant amount of progress has been made. Below I showcase a few generation algorithms and constraints that have been ported:

```lisp
; original (v810)
(defcode lshi4-const (lsh i4 (= r) (co-fixnum c)) (reg r r)
  (gen ((r . W-regs)) ; all registers are open
    (shl (i4 'c) 'r))) ; generate a shl instruction

; modified (65816)
(defcode lshi2-const (lsh i2 (= r) (co-fixnum c)) (reg r r)
  (gen ((r . A-regs)) ; constrain to Accumulator
    (progn (dotimes (i c) ; emit one shift at a time
        (emit-mcode 'asl) ))))
```

```lisp
; original (v810)
(defcode jump2i4-general (jump2 ((jcode jmc) * (= r (* i2)) (= p (* i2))) la)
  (reg nil r p)
  (gen ((r . W-regs) (p . W-regs)) ; all registers may be compared with each other
    (cmp 'p 'r)
    ('jmc 'la)))

; modified (65816)
(defcode jump2i2-mem (jump2 ((jcode jmc) * (= r (* i2)) (get i2 (const i2 (= p)))) la)
  (reg nil r) ; system has no register-register compare
  (gen ((r . W-regs))
    (progn
      (cond ; each register has its own register-memory compare instruction
        ((areg-p r) (emit-mcode (list 'cmp (list 'mem16 p))))
        ((xreg-p r) (emit-mcode (list 'cpx (list 'mem16 p))))
        ((yreg-p r) (emit-mcode (list 'cpy (list 'mem16 p))))
      (emit-mcode (list 'jmc 'la)) ))))
```


```lisp
; original (v810)
(defcsp caller-save-regs nil (r6W r7W r8W r9W r11W r12W r13W r14W r15W r16W r17W r18W r19W))

; modified (65816)
(defcsp caller-save-regs nil (x.w y.w)) ; X and Y preserved, Accumulator is a scratch register

```

