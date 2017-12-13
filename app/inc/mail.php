<?php
	if (isset($_POST["submit"])) {
		
		$nom = $_POST['nom'];
		$email = $_POST['email'];
		$phone = $_POST['phone'];
		$message = $_POST['message'];

		// Headers
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n";
		$headers .= 'From: contact@renovationdeoliveira.fr' . "\r\n";
		$to = 'contact@renovationdeoliveira.fr';
		$subject  = 'Contact via le site internet de ' . $nom;

		// Texte
		$body = '
		<html>
			<head>
				<title>Contact via le site internet</title>
			</head>

			<body>
				<p>Bonjour, un visiteur a pris contact via le formulaire du site.</p>
				<p>Voici les détails : </p>';

				$body .= "<p>Nom : " .$nom. '</p>'. "\r\n";
				$body .= "<p>E-mail : " .$email. '</p>'. "\r\n";
				$body .= "<p>Téléphone : " .$phone. '</p>'. "\r\n";
				$body .= "<p>Message : ". '</p><p>' .$message. '</p>';

				$body .=
			'</body>
		</html>';


		// If there are no errors, send the email
			if (mail($to, $subject, $body, $headers)) {
				$resultok='<div class="alert alert-success">Message envoyé. Merci.</div>';
			} else {
				$resultko='<div class="alert alert-danger">Une erreur est survenue. Si elle persiste: 06 49 15 89 14</div>';
			}
		}
		
		// Dossier d'upload des fichiers de traçage d'emails
		$upload_dir = $_SERVER['DOCUMENT_ROOT']. '/../mails/' .date('Y'). '/' .date('m'). '/';

		checkDirorCreate($_SERVER['DOCUMENT_ROOT']. '/../mails/');

		checkDirorCreate($_SERVER['DOCUMENT_ROOT']. '/../mails/' .date('Y'));

		checkDirorCreate($_SERVER['DOCUMENT_ROOT']. '/../mails/' .date('Y') .'/'. date('m'));

		$file_name  = '' .date('Y-m-d'). '_';
		$file_name .= date('H'). 'h' .date('i'). 'm' .date('s'). 's_' .wd_remove_accents($user_name);

		$file_content  = "Nom : " .$nom. "\n";
		$file_content .= "E-mail : " .$email. "\n";

		$file_content .= "Téléphone : " .$phone. "\n";

		$file_content .= "Message : " . "\n".$message;

		file_put_contents($upload_dir .$file_name. '.txt', $file_content);


		function checkDirorCreate($path)
		{
		// Vérifie si le répertoire existe bien
			if (file_exists($path) == false)
			{
				mkdir($path);
			}
		}

		function wd_remove_accents($str, $charset='utf-8')
		{
			$str = htmlentities($str, ENT_NOQUOTES, $charset);

			$str = preg_replace('#&([A-za-z])(?:acute|cedil|caron|circ|grave|orn|ring|slash|th|tilde|uml);#', '\1', $str);
			$str = preg_replace('#&([A-za-z]{2})(?:lig);#', '\1', $str); // pour les ligatures e.g. '&oelig;'
			$str = preg_replace('#&[^;]+;#', '', $str); // supprime les autres caractères

			return $str;
		}
?>