<script lang="ts">
	// Landing page - First page users see
</script>

<svelte:head>
	<title>Biais & Moi — Accueil</title>
</svelte:head>

<main>
	<div class="container">
		<img src="/images/chulogo.png" alt="CHU Montpellier" class="chu-logo" />
		
		<h1>Bienvenue sur Biais Et Moi !</h1>
		
		<p class="project-team">
			<strong>Porteurs du projet :</strong> <a href="mailto:p-rouillard@chu-montpellier.fr">Paul Rouillard</a> et Dr Clémentine Saujeon
		</p>
		
		<p>
			Il s'agit d'un test se basant sur des travaux de chercheurs d'Harvard<sup><a href="#note1">1</a></sup> ayant développé le Test d'Association Implicite (TAI) permettant de tester nos biais cognitifs implicites (ceux auxquels on ne pense pas être soumis).
		</p>
		
		<p>
			Ce test est <b>anonyme</b><sup><a href="#note2">2</a></sup> et personnel. Il ne permet de vous tester pour l'instant que sur des biais cognitifs racistes.
		</p>
		
		<p>
			Il débute par quelques questions sur vous.
		</p>
		
		<p>
			Puis il se compose de 7 parties. Les instructions changeant à chaque fois, attention à bien les lire.
		</p>
		
		<p>
			Les résultats vous seront rendus immédiatement à la fin.
		</p>
		
		<section class="requirements">
			<h2>Conditions obligatoires pour faire ce test :</h2>
			<ul>
				<li>Endroit sans distraction pendant la durée du test (5min)</li>
				<li>Être sur un ordinateur</li>
			</ul>
		</section>
		
		<p class="consent">
			Ce test est <strong>en cours de validation</strong><sup><a href="#note3">3</a></sup>. En poursuivant ce test, j'accepte que mes réponses soient utilisées et analysées à des fins de recherche scientifique.
		</p>
		
		<div class="cta-container">
			<a href="/identity" class="cta-button">Commencer</a>
		</div>
		
		<section class="footnotes">
			<h3>Références et notes</h3>
			<div class="footnote" id="note1">
				<sup>1</sup> Nosek, B. A., Smyth, F. L., Hansen, J. J., Devos, T., Lindner, N. M., Ratliff (Ranganath), K. A., Smith, C. T., Olson, K. R., Chugh, D., Greenwald, A. G., & Banaji, M. R. (2007). Pervasiveness and correlates of implicit attitudes and stereotypes. <em>European Review of Social Psychology, 18</em>, 36-88. 
				<a href="https://faculty.washington.edu/agg/pdf/Nosek%20&%20al.PCIAS.ERSP.2007.pdf" target="_blank" rel="noopener noreferrer">https://faculty.washington.edu/agg/pdf/Nosek%20&%20al.PCIAS.ERSP.2007.pdf</a>
			</div>
			<div class="footnote" id="note2">
				<sup>2</sup> Aucune donnée permettant d'identifier directement ou indirectement les participants n'est collectée. Les données recueillies ne constituent donc pas des données à caractère personnel au sens du règlement général sur la protection des données - RGPD. Le projet s'inscrit dans le cadre d'une recherche scientifique menée au sein d'un CHU et respecte les principes éthiques de la recherche, notamment l'information des participants et leur consentement libre et éclairé. Ces données ne sont utilisées que pour l'étude en cours et concernent l'ensemble des informations épidémiologiques ainsi que le résultat du test. Vous avez le droit de vous opposer à la récolte de ces données en adressant un mail au destinataire du projet.
			</div>
			<div class="footnote" id="note3">
				<sup>3</sup> Test en développement. Les résultats de l'étude seront disponibles en mai 2026.
			</div>
		</section>
	</div>
</main>

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: 2rem;
	}

	.container {
		max-width: 800px;
		width: 100%;
		background: white;
		padding: 3rem;
		border-radius: 12px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02), 0 1px 2px rgba(0, 0, 0, 0.03);
		position: relative;
	}

	.chu-logo {
		position: absolute;
		top: 1.5rem;
		right: 1.5rem;
		max-width: 120px;
		height: auto;
	}

	h1 {
		font-size: 1.875rem;
		margin: 0 0 0.5rem 0;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	.project-team {
		font-size: 0.8125rem;
		color: #6b7280;
		margin-bottom: 2rem;
		line-height: 1.5;
	}

	.project-team a {
		color: #2563eb;
		text-decoration: none;
	}

	.project-team a:hover {
		text-decoration: underline;
	}

	p {
		font-size: 1rem;
		line-height: 1.65;
		margin-bottom: 1.25rem;
		font-weight: 400;
	}

	p sup {
		font-size: 0.75em;
		line-height: 0;
	}

	p sup a {
		color: #2563eb;
		text-decoration: none;
		font-weight: 500;
	}

	p sup a:hover {
		text-decoration: underline;
	}

	.consent {
		background-color: #fef3c7;
		border-left: 3px solid #fbbf24;
		padding: 1.25rem;
		margin: 2rem 0;
		border-radius: 6px;
		font-size: 0.9375rem;
	}

	.requirements {
		margin-top: 2rem;
		padding: 1.5rem;
		background-color: #fafafa;
		border-radius: 8px;
		border: 1px solid #f0f0f0;
	}

	.requirements h2 {
		font-size: 1.125rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.requirements ul {
		list-style-type: disc;
		margin-left: 1.5rem;
	}

	.requirements li {
		font-size: 0.9375rem;
		line-height: 1.6;
		margin-bottom: 0.5rem;
	}

	.cta-container {
		margin-top: 2.5rem;
		text-align: center;
	}

	.cta-button {
		display: inline-block;
		padding: 0.875rem 2rem;
		background-color: #2c2c2c;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 500;
		transition: all 0.2s ease;
		box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
	}

	.cta-button:hover {
		background-color: #1a1a1a;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.footnotes {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 2px solid #e5e5e5;
	}

	.footnotes h3 {
		font-size: 1.125rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.footnote {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background-color: #fafafa;
		border-radius: 6px;
		font-size: 0.875rem;
		line-height: 1.65;
	}

	.footnote sup {
		font-weight: 600;
		margin-right: 0.5rem;
		color: #2c2c2c;
	}

	.footnote a {
		color: #2563eb;
		text-decoration: none;
		word-break: break-word;
		display: block;
		margin-top: 0.5rem;
	}

	.footnote a:hover {
		text-decoration: underline;
	}

	.footnote em {
		font-style: italic;
	}
</style>
