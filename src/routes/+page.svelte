<script lang="ts">
	// Landing page - First page users see
</script>

<main>
	<div class="container">
		<h1>Bienvenue sur <em>nom du test en cours de création</em> !</h1>
		
		<p>
			Il s'agit d'un test se basant sur les travaux de recherche de Harvard ayant développé 
			les TAI permettant de tester nos biais cognitifs implicites (ceux dont on ne pense pas 
			être victimes).
		</p>
		
		<p>
			Ce test est anonyme et personnel. Il ne permet de vous tester pour l'instant que sur 
			des biais cognitifs raciaux.
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
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1.5rem;
		color: #333;
	}

	em {
		font-style: italic;
	}

	p {
		font-size: 1.125rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
		color: #555;
	}

	.requirements {
		margin-top: 2rem;
		padding: 1.5rem;
		background-color: #f5f5f5;
		border-radius: 8px;
	}

	.requirements h2 {
		font-size: 1.25rem;
		margin-bottom: 1rem;
		color: #333;
	}

	.requirements ul {
		list-style-type: disc;
		margin-left: 1.5rem;
	}

	.requirements li {
		font-size: 1.125rem;
		line-height: 1.6;
		margin-bottom: 0.5rem;
		color: #555;
	}

	.cta-container {
		margin-top: 2.5rem;
		text-align: center;
	}

	.cta-button {
		display: inline-block;
		padding: 1rem 2.5rem;
		background-color: #ff3e00;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-size: 1.25rem;
		font-weight: 600;
		transition: background-color 0.2s ease;
	}

	.cta-button:hover {
		background-color: #cc3200;
	}
</style>
