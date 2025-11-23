<script lang="ts">
	// Landing page - First page users see
</script>

<svelte:head>
	<title>Biais & Moi — Accueil</title>
</svelte:head>

<main>
	<div class="container">
		<h1>Bienvenue sur Biais Et Moi !</h1>
		
		<p>
			Ce test s'inscrit dans le cadre d'une thèse de médecine mais restera en ligne après la soutenance de la dite-thèse.
		</p>
		
		<p>
			Il s'agit d'un test se basant sur des travaux de chercheurs d'Harvard ayant développé le Test d'Association Implicite (TAI) permettant de tester nos biais cognitifs implicites (ceux auxquels on ne pense pas être soumis).
		</p>
		
		<p>
			Ce test est <b>anonyme</b> et personnel. Il ne permet de vous tester pour l'instant que sur des biais cognitifs racistes.
		</p>
		
		<p>
			Il y a d'abord quelques questions sur vous.
		</p>
		
		<p>
			Puis le test se compose de 7 parties. Les instructions changeant à chaque fois, attention à bien les lire.
		</p>
		
		<p>
			Les résultats vous seront rendus immédiatement à la fin.
		</p>
		
		<section class="requirements">
			<h2>Conditions obligatoires pour faire ce test :</h2>
			<ul>
				<li>Endroit sans distraction pendant la durée du test (10min)</li>
				<li>Être sur un ordinateur</li>
			</ul>
		</section>
		
		<div class="cta-container">
			<a href="/identity" class="cta-button">Commencer</a>
		</div>
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
	}

	h1 {
		font-size: 1.875rem;
		margin-bottom: 1.5rem;
		font-weight: 600;
		letter-spacing: -0.01em;
	}

	p {
		font-size: 1rem;
		line-height: 1.65;
		margin-bottom: 1.25rem;
		font-weight: 400;
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
</style>
