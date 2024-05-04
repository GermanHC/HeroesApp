import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { filter, switchMap, tap } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';

import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: ``
})
export class NewPageComponent implements OnInit {
  public heroForm =   new FormGroup({
    id:               new FormControl<string>(''),
    superhero:        new FormControl<string>('', { nonNullable: true }),
    publisher:        new FormControl<Publisher>( Publisher.DCComics ),
    alter_ego:        new FormControl(''),
    first_appearance: new FormControl(''),
    characters:       new FormControl(''),
    alt_img:          new FormControl('')
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics' }
  ];

  constructor(
    private activatedRoute: ActivatedRoute,
    private dialog: MatDialog,
    private heroesService: HeroesService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  get currentHero(): Hero {
    const hero= this.heroForm.value as Hero;
    return hero;
  }

  ngOnInit(): void {
    if (!this.router.url.includes('edit')) return;

    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroById( id ) ),
      ).subscribe( hero => {
        if (!hero)
          return this.router.navigateByUrl('/');

        this.heroForm.reset( hero );
        return;
      } );
  }

  onSubmit(): void {
    if (this.heroForm.invalid) return;

    if (this.currentHero.id) {
      this.heroesService.updateHero( this.currentHero )
        .subscribe(hero =>{
          this.showSnackBar(`${ hero.superhero } updated!`);
    });
        return;
      }

    this.heroesService.addHero( this.currentHero )
      .subscribe(hero => {
        this.router.navigate(['/heroes/edit', hero.id]);
        this.showSnackBar(`${ hero.superhero } created!`);
      });
  }

  onDeleteHero(): void {
    if (!this.currentHero.id) throw new Error('Hero Id is requered');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });

    dialogRef.afterClosed()
      .pipe(
        filter( (result: boolean) => result ),
        switchMap( () => this.heroesService.deleteHeroById( this.currentHero.id ) ),
        filter( (wasDeleted: boolean) => wasDeleted )
      )
      .subscribe( () => {
        this.router.navigate(['/heroes']);
        this.showSnackBar(`${ this.currentHero.superhero } deleted!`);
      });
    // dialogRef.afterClosed().subscribe(result => {
    //   if (!result)  return;

    //   this.heroesService.deleteHeroById( this.currentHero.id! )
    //     .subscribe( wasDeleted => {
    //       if (!wasDeleted) return;
    //       this.router.navigate(['/heroes']);
    //       this.showSnackBar(`${ this.currentHero.superhero } deleted!`);
    //     });
    // });
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'Done', {
      duration: 2500
    });
  }
}
